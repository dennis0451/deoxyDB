import { Component } from '@angular/core';
import { UploadComponent } from '../../components/upload/upload.component';
@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [UploadComponent],
  templateUrl: './uploadPage.component.html',
  styleUrl: './uploadPage.component.css'
})
export class UploadPageComponent {

}
