import { Router } from '@angular/router';
import { Component, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule],
})
export class NavComponent {
  constructor(private router: Router, private authService: AuthService) {}

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
  
  logout() {
    this.authService.logout(); // This will clear session storage and navigate to the auth page
    this.router.navigate(['/auth']); // Redirect to login/auth page
  }
}
