export interface Document {
  id: string;
  nombre_archivo: string;
  categoria: 'protocolo' | 'normativa' | 'historia_clinica';
  fecha_carga: string;
  usuario_id: string;
  num_chunks: number;
  estado: string;
}

export interface DocumentList {
  total: number;
  documents: Document[];
}

export interface DocumentUploadResponse {
  message: string;
  document_id: string;
  filename: string;
  chunks_created: number;
  category: string;
}
