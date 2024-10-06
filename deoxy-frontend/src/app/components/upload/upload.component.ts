import { Component, ViewEncapsulation } from '@angular/core';
import { FileService } from '../../services/file.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { UploadConfirmationComponent } from '../upload-confirmation/upload-confirmation.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    UploadConfirmationComponent,
    MatProgressSpinnerModule
  ],
  // encapsulation: ViewEncapsulation.None,
})
export class UploadComponent {
  selectedFiles!: FileList;
  selectedFileName: string = '';  // Added property to hold the selected file name
  dnaSequence!: string;
  isUploading: boolean = false;  // Tracks the upload state


  constructor(private fileService: FileService, private router: Router) {}

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.selectedFileName = this.selectedFiles[0].name;  // Set the selected file name
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.dnaSequence = '';
    this.isUploading = true;  // Show spinner when upload starts

    if (this.selectedFiles) {
      this.fileService.uploadFiles(this.selectedFiles).subscribe(
        response => {
          const dnaSequence = (response.dnaSequence as unknown as { dna_sequence: string }).dna_sequence;
          if (dnaSequence) {
            this.dnaSequence = dnaSequence.substring(0, 63);
            console.log('DNA Sequence:', dnaSequence);  // Log the value
            this.isUploading = false;  // Hide spinner when upload is complete

            this.resetForm();  // Reset form after successful upload
          } else {
            this.isUploading = false;  

            console.error('DNA sequence not found in the response');
          }
        },
        error => {
          console.error('Upload failed:', error);
          this.isUploading = false;  

        }
      );
    } else {
      console.error('No files selected');
      this.isUploading = false;  

    }
  }

  resetForm() {
    this.selectedFiles = undefined as any;
    this.selectedFileName = '';  // Clear the file name when the form is reset
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';  // Clear the file input
    }
  }
  navigateToManagement() {
    this.router.navigate(['/management']);
  }
}
