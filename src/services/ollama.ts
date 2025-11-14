import axios from 'axios';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

class OllamaService {
  private baseURL: string;
  private currentModel: string;

  constructor(baseURL = 'http://localhost:11434') {
    this.baseURL = baseURL;
    this.currentModel = 'glm4:9b'; // Modelo padrão
  }

  setModel(model: string) {
    this.currentModel = model;
  }

  getModel() {
    return this.currentModel;
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  async chat(
    messages: Message[],
    onChunk?: (chunk: string) => void,
    tools?: Tool[]
  ): Promise<string> {
    try {
      console.log('🤖 Sending to Ollama:', { model: this.currentModel, messagesCount: messages.length });
      
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages,
          stream: true,
          tools: tools || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const parsed: OllamaStreamChunk = JSON.parse(line);
            
            if (parsed.message?.content) {
              fullResponse += parsed.message.content;
              if (onChunk) {
                onChunk(parsed.message.content);
              }
            }

            if (parsed.done) {
              console.log('✅ Ollama response complete');
              return fullResponse;
            }
          } catch (e) {
            console.warn('Failed to parse line:', line);
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('❌ Error in chat:', error);
      throw error;
    }
  }

  async generate(
    prompt: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.currentModel,
          prompt,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            if (parsed.response) {
              fullResponse += parsed.response;
              if (onChunk) {
                onChunk(parsed.response);
              }
            }

            if (parsed.done) {
              return fullResponse;
            }
          } catch (e) {
            // Ignora linhas inválidas
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error in generate:', error);
      throw error;
    }
  }
}

export const ollamaService = new OllamaService();
