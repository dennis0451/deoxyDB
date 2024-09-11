import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api'; // Express server base URL

  constructor(private http: HttpClient) {}

  // Method to get data from /api/data endpoint
  getData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/data`);
  }

  saveDNASequence(dnaSequence: string): Observable<{ dnaSequence: string }> {
    return this.http.post<{ dnaSequence: string }>(`${this.apiUrl}/save`, { dnaSequence
    });
  }

  uploadFiles(files: FileList): Observable<{ dnaSequence: string }> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]); // Append each file to formData
    }

    return this.http.post<{ dnaSequence: string }>(`${this.apiUrl}/upload`, formData);
  }

  updateDnaSequence(row: any): Observable<any> {
    // Send the updated row (file_name) as the body of the PUT request
    return this.http.put(`${this.apiUrl}/update/${row.file_id}`, { file_name: row.file_name });
  }
  

  // Method to fetch DNA sequences
  getDnaSequences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dnasequences`);
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileId}`, { responseType: 'blob' });
  }

  getImagePreviewUrl(fileId: number): string {
    return `${this.apiUrl}/preview/${fileId}`; // Returns the full URL for the image
  }

}
