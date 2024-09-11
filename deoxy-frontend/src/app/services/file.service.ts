// src/app/services/file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  uploadFiles(files: FileList): Observable<{ dnaSequence: string }> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]); // Ensure the field name matches what the server expects
    }
    return this.http.post<{ dnaSequence: string }>(`${this.apiUrl}/upload`, formData);
  }

  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files`);
  }
}
