import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-upload-confirmation',
  templateUrl: './upload-confirmation.component.html',
  styleUrls: ['./upload-confirmation.component.css']
})
export class UploadConfirmationComponent {
  @Input() dnaSequence!: string;
}
