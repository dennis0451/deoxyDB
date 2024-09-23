// import { Component } from '@angular/core';
// import { FileService } from '../../services/file.service'; // Use FileService
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../../services/auth.service'; // Import AuthService

// @Component({
//   selector: 'app-upload',
//   standalone: true,
//   templateUrl: './upload.component.html',
//   imports: [MatButtonModule, MatToolbarModule, MatInputModule, MatFormFieldModule, CommonModule], // Ensure all modules are included
// })
// export class UploadComponent {
//   selectedFiles!: FileList;
//   dnaSequence!: string;
//   userId!: number; // Store userId

//   constructor(private fileService: FileService, private authService: AuthService) {} // Inject AuthService

//   ngOnInit() {
//     // Retrieve user info from AuthService
//     const userInfo = this.authService.getUserInfo();
//     if (userInfo) {
//       this.userId = userInfo.id; // Assuming the id is stored in userInfo object
//     } else {
//       console.error('User is not logged in');
//     }
//   }

//   onFileSelected(event: any) {
//     this.selectedFiles = event.target.files;
//   }

//   onSubmit(event: Event) {
//     event.preventDefault();

//     if (this.selectedFiles && this.userId) {
//       this.fileService.uploadFiles(this.selectedFiles, this.userId).subscribe(response => {
//         console.log('DNA Sequence:', response.dnaSequence); // Log the DNA sequence from the backend
//         // Display the first 52 characters of the DNA sequence
//         // this.dnaSequence = response.dnaSequence.substring(0, 52);
//       }, error => {
//         console.error('Upload failed:', error);
//       });
//     } else {
//       console.error('No files selected or user is not logged in');
//     }
//   }
// }
// upload.component.ts
import { Component } from '@angular/core';
import { FileService } from '../../services/file.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './upload.component.html',
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule
  ]
})
export class UploadComponent {
  selectedFiles!: FileList;
  dnaSequence!: string;

  constructor(private fileService: FileService) {}

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.selectedFiles) {
      this.fileService.uploadFiles(this.selectedFiles).subscribe(
        response => {
          console.log('DNA Sequence:', response.dnaSequence);
          // this.dnaSequence = response.dnaSequence.substring(0, 52);
        },
        error => {
          console.error('Upload failed:', error);
        }
      );
    } else {
      console.error('No files selected');
    }
  }
}
