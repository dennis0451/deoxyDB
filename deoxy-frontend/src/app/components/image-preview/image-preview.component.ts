import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule

@Component({
  selector: 'app-image-preview',
  standalone: true,
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css'],
  imports: [CommonModule, MatProgressSpinnerModule], // Import both CommonModule and MatProgressSpinnerModule
})
export class ImagePreviewComponent {
  imageUrl: string | null = null;
  loading: boolean = true; // Boolean to track the loading state

  constructor(@Inject(MAT_DIALOG_DATA) public data: { fileId: number }) {
    // Set the image URL from the provided data
    this.imageUrl = `http://localhost:3000/api/preview/${data.fileId}`;
  }

  // Called when the image finishes loading
  onImageLoad() {
    this.loading = false; // Set loading to false when the image is fully loaded
  }
}
