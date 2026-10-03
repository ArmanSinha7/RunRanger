export interface Health {
  ok: boolean;
  mode: 'ai' | 'demo';
  ollama_running: boolean;
  model: string;
  model_installed: boolean;
  message: string;
}
