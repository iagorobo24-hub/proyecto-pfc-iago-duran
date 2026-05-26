export interface AIRequestBody {
  provider?: string;
  model?: string;
  messages: Array<{ role: string; content: string }>;
  system?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  raw: Record<string, unknown>;
  provider?: string;
  model?: string;
}

export interface AIFicha {
  caracteristicas: string[];
  aplicaciones: string[];
  normas: string[];
  url_manual?: string;
  consejo_tecnico?: string;
  [key: string]: unknown;
}
