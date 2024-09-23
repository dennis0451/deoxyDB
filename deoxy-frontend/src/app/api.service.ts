import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  
    // Get the token from local storage
    const token = localStorage.getItem('token');
  console.log('Token:', token);
  
    // Include the token in the headers
    const headers = { 
      'Authorization': `Bearer ${token}`
    };
  
    return this.http.post<{ dnaSequence: string }>(`${this.apiUrl}/upload`, formData, { headers });
  }
  

  updateDnaSequence(row: any): Observable<any> {
    // Send the updated row (file_name) as the body of the PUT request
    return this.http.put(`${this.apiUrl}/update/${row.file_id}`, { file_name: row.file_name });
  }
  

  // Method to fetch DNA sequences
// Method to fetch DNA sequences based on the userId
getDnaSequences(): Observable<any[]> {
  // Get the token from local storage
  const token = localStorage.getItem('token');

  // Include the token in the Authorization header
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  // Pass the token via the header
  return this.http.get<any[]>(`${this.apiUrl}/dnasequences`, { headers });
}

  

  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileId}`, { responseType: 'blob' });
  }

  getImagePreviewUrl(fileId: number): string {
    return `${this.apiUrl}/preview/${fileId}`; // Returns the full URL for the image
  }

  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Method to login a user
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
  
}
