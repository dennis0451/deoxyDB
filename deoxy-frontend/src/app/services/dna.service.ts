// src/app/services/dna.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DnaService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getDnaSequence(fileId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dnasequences/${fileId}`);
  }
}
