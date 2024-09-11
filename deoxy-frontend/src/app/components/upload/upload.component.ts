import { Component } from '@angular/core';
import { FileService } from '../../services/file.service'; // Import the FileService
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './upload.component.html',
  imports: [MatButtonModule, MatToolbarModule, MatInputModule, MatFormFieldModule, CommonModule], // Ensure all modules are included
})
export class UploadComponent {
  selectedFiles!: FileList;
  dnaSequence!: string;

  constructor(private fileService: FileService) {} // Inject FileService

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.selectedFiles) {
      this.fileService.uploadFiles(this.selectedFiles).subscribe(response => {
        console.log('DNA Sequence:', response.dnaSequence); // Log the DNA sequence from the backend
        //first 26 characters of the DNA sequence
        this.dnaSequence = (response.dnaSequence as any).dna_sequence.substring(0, 52);
      });
    }
  }
}
