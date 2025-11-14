import { 
  FileText, 
  FileCode, 
  FileJson, 
  Image, 
  Film, 
  Music, 
  Archive, 
  File as FileIcon,
  Database,
  Settings,
  Package,
  FileType,
  Braces,
  Code2,
  FileImage
} from 'lucide-react';

export function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  // JavaScript/TypeScript
  if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
    return { icon: FileCode, color: '#f7df1e' }; // JavaScript yellow
  }
  if (['ts', 'tsx'].includes(ext)) {
    return { icon: FileCode, color: '#3178c6' }; // TypeScript blue
  }
  
  // Web
  if (ext === 'html' || ext === 'htm') {
    return { icon: Code2, color: '#e34c26' }; // HTML orange
  }
  if (ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less') {
    return { icon: FileType, color: '#563d7c' }; // CSS purple
  }
  
  // Data/Config
  if (ext === 'json') {
    return { icon: FileJson, color: '#5a5a5a' }; // JSON gray
  }
  if (['yaml', 'yml'].includes(ext)) {
    return { icon: Settings, color: '#cb171e' }; // YAML red
  }
  if (['xml', 'svg'].includes(ext)) {
    return { icon: Braces, color: '#ff6600' }; // XML orange
  }
  if (['toml', 'ini', 'conf', 'config'].includes(ext)) {
    return { icon: Settings, color: '#6d6d6d' }; // Config gray
  }
  
  // Programming Languages
  if (['py', 'pyw', 'pyc'].includes(ext)) {
    return { icon: FileCode, color: '#3776ab' }; // Python blue
  }
  if (['java', 'class', 'jar'].includes(ext)) {
    return { icon: FileCode, color: '#b07219' }; // Java orange
  }
  if (['go', 'mod'].includes(ext)) {
    return { icon: FileCode, color: '#00add8' }; // Go cyan
  }
  if (['rs', 'toml'].includes(ext)) {
    return { icon: FileCode, color: '#dea584' }; // Rust orange
  }
  if (['c', 'h'].includes(ext)) {
    return { icon: FileCode, color: '#555555' }; // C gray
  }
  if (['cpp', 'cc', 'cxx', 'hpp'].includes(ext)) {
    return { icon: FileCode, color: '#f34b7d' }; // C++ pink
  }
  if (['cs', 'csx'].includes(ext)) {
    return { icon: FileCode, color: '#178600' }; // C# green
  }
  if (['php', 'phtml'].includes(ext)) {
    return { icon: FileCode, color: '#4f5d95' }; // PHP purple
  }
  if (['rb', 'erb'].includes(ext)) {
    return { icon: FileCode, color: '#cc342d' }; // Ruby red
  }
  
  // Shell/Scripts
  if (['sh', 'bash', 'zsh', 'fish'].includes(ext)) {
    return { icon: FileCode, color: '#89e051' }; // Shell green
  }
  if (['bat', 'cmd', 'ps1'].includes(ext)) {
    return { icon: FileCode, color: '#c1f12e' }; // Batch green
  }
  
  // Markup/Documentation
  if (['md', 'markdown'].includes(ext)) {
    return { icon: FileText, color: '#083fa1' }; // Markdown blue
  }
  if (['txt', 'log'].includes(ext)) {
    return { icon: FileText, color: '#6d6d6d' }; // Text gray
  }
  if (['pdf'].includes(ext)) {
    return { icon: FileText, color: '#ff0000' }; // PDF red
  }
  
  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico'].includes(ext)) {
    return { icon: Image, color: '#a074c4' }; // Image purple
  }
  if (['svg'].includes(ext)) {
    return { icon: FileImage, color: '#ffb13b' }; // SVG orange
  }
  
  // Media
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) {
    return { icon: Film, color: '#fd971f' }; // Video orange
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
    return { icon: Music, color: '#f92672' }; // Audio pink
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return { icon: Archive, color: '#eeeeee' }; // Archive white
  }
  
  // Database
  if (['sql', 'db', 'sqlite', 'sqlite3'].includes(ext)) {
    return { icon: Database, color: '#dad8d8' }; // Database gray
  }
  
  // Package/Dependencies
  if (['lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'].includes(fileName)) {
    return { icon: Package, color: '#cb3837' }; // Lock red
  }
  if (['package.json', 'composer.json', 'cargo.toml', 'go.mod'].includes(fileName)) {
    return { icon: Package, color: '#e8274b' }; // Package red
  }
  
  // Special files
  if (['.gitignore', '.dockerignore', '.npmignore'].includes(fileName)) {
    return { icon: Settings, color: '#41535b' }; // Ignore gray
  }
  if (['dockerfile', '.dockerfile'].includes(fileName.toLowerCase())) {
    return { icon: Package, color: '#384d54' }; // Docker blue
  }
  if (['.env', '.env.local', '.env.development', '.env.production'].includes(fileName.toLowerCase())) {
    return { icon: Settings, color: '#faf594' }; // Env yellow
  }
  if (['readme.md', 'readme'].includes(fileName.toLowerCase())) {
    return { icon: FileText, color: '#4078c0' }; // README blue
  }
  
  // Default
  return { icon: FileIcon, color: '#6d6d6d' }; // Default gray
}
