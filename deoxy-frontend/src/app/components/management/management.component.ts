import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../api.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';
import { AuthService, UserInfo } from '../../services/auth.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    MatTableModule, 
    MatButtonModule, 
    FormsModule, 
    CommonModule, 
    MatBottomSheetModule, 
    MatButtonModule, 
    MatDialogModule
  ], // Add FormsModule for ngModel
  templateUrl: './management.component.html',
  styleUrl: './management.component.css'
})
export class ManagementComponent {
  displayedColumns: string[] = ['file_id', 'file_name', 'dna_sequence', 'actions'];
  dataSource: any[] = [];
  editingRows: { [key: number]: boolean } = {}; // Track which rows are being edited
  user?: UserInfo;

  constructor(
    private apiService: ApiService, 
    private dialog: MatDialog,  
    private authService: AuthService // Inject AuthService to get user data
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Fetch data for the logged-in user (handled by token in the backend)
    this.apiService.getDnaSequences().subscribe(
      (data: any) => {
        this.dataSource = data;
        console.log('DNA Sequences:', data);
      },
      (error) => {
        console.error('Error fetching DNA sequences:', error);
      }
    );
  }

  // Edit a row (enable input fields)
  editRow(fileId: number) {
    this.editingRows[fileId] = true;
  }

  // Save the edited row and send the updated data to the server
  saveRow(row: any) {
    this.editingRows[row.file_id] = false; // Disable editing
    this.apiService.updateDnaSequence(row).subscribe(response => {
      console.log('Row updated successfully', response);
    });
  }

  // Trigger the file download
  downloadFile(fileId: number) {
    const downloadUrl = `http://localhost:3000/api/download/${fileId}`;
    window.location.href = downloadUrl;  // This will trigger the file download
  }

  // Preview the image
  previewImage(fileId: number) {
    console.log('Previewing image with fileId:', fileId);
    
    this.dialog.open(ImagePreviewComponent, {
      data: { fileId }, // Pass the fileId to the dialog
      width: '500px' // Optional: set the size of the dialog
    });
  }
}
