import axios from 'axios';

class TTSService {
  private apiKey: string;
  private baseURL = 'https://api.elevenlabs.io/v1';
  private voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - voz masculina clara
  private isEnabled = false;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    // Pega a chave do .env
    this.apiKey = import.meta.env.VITE_ELEVEN_LABS_KEY || '';
    this.isEnabled = !!this.apiKey;
    
    if (!this.isEnabled) {
      console.warn('⚠️ ElevenLabs API key not found. TTS disabled.');
    } else {
      console.log('✅ ElevenLabs TTS enabled');
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.isEnabled) {
      console.warn('⚠️ TTS is disabled (no API key)');
      return;
    }

    // Para o áudio anterior se estiver tocando
    this.stop();

    try {
      console.log('🔊 Speaking:', text.substring(0, 50) + '...');

      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${this.voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        }
      );

      // Converte para blob e toca
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      this.currentAudio = new Audio(url);
      this.currentAudio.play();

      // Limpa URL quando terminar
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
      };

    } catch (error: any) {
      console.error('❌ TTS error:', error.response?.data || error.message);
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  enable(): void {
    if (this.apiKey) {
      this.isEnabled = true;
      console.log('✅ TTS enabled');
    }
  }

  disable(): void {
    this.stop();
    this.isEnabled = false;
    console.log('⚠️ TTS disabled');
  }

  toggle(): boolean {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  getStatus(): { enabled: boolean; playing: boolean } {
    return {
      enabled: this.isEnabled,
      playing: this.isPlaying()
    };
  }
}

export const ttsService = new TTSService();
