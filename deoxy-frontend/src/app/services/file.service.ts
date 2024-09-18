import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:3000/api'; // Base URL for API

  constructor(private http: HttpClient) {}

  // Method to upload files with Authorization token
  uploadFiles(files: FileList, userId: number): Observable<{ dnaSequence: string }> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]); // Append each file to formData
    }
  
    // Add the userId to the formData (as an additional field)
    formData.append('userId', userId.toString());
  
    // Make the HTTP request without the token for now
    return this.http.post<{ dnaSequence: string }>(`${this.apiUrl}/upload`, formData);
  }
  


  // Method to get the uploaded files (optional, based on your API)
  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files`);
  }
}
