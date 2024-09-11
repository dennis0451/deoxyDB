import { Component } from '@angular/core';
import { ManagementComponent } from '../../components/management/management.component';

@Component({
  selector: 'app-management-page',
  standalone: true,
  imports: [ManagementComponent],
  templateUrl: './managementPage.component.html',
  styleUrl: './managementPage.component.css'
})
export class ManagementPageComponent {

}
