import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Document, DocumentList, DocumentUploadResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<Document[]> {
    return this.http.get<DocumentList>(`${this.apiUrl}/documents`).pipe(
      map(res => res.documents)
    );
  }

  uploadDocument(file: File, categoria: string): Observable<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoria', categoria);
    return this.http.post<DocumentUploadResponse>(`${this.apiUrl}/documents/upload`, formData);
  }

  deleteDocument(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/documents/${id}`);
  }
}
