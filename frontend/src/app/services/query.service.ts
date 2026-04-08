import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { QueryRequest, QueryResponse, QueryHistoryItem, QueryHistoryResponse } from '../models/query.model';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendQuery(request: QueryRequest): Observable<QueryResponse> {
    return this.http.post<QueryResponse>(`${this.apiUrl}/query`, request);
  }

  getHistory(): Observable<QueryHistoryItem[]> {
    return this.http.get<QueryHistoryResponse>(`${this.apiUrl}/query/history`).pipe(
      map(res => res.queries)
    );
  }
}
