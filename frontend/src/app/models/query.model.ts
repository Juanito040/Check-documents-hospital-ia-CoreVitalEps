export interface QueryRequest {
  question: string;
  category_filter?: 'protocolo' | 'normativa' | 'historia_clinica';
  top_k?: number;
}

export interface Source {
  document_id: string;
  filename: string;
  category: string;
  chunk_index: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  chunks_used: number;
  response_time_ms: number;
  category_filter?: string;
}

export interface QueryHistoryItem {
  id: number;
  pregunta: string;
  respuesta: string;
  fecha: string;
  tiempo_respuesta_ms: number;
}

export interface QueryHistoryResponse {
  total: number;
  queries: QueryHistoryItem[];
}
