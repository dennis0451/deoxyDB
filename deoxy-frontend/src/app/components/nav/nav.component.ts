import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule, MatIconModule, CommonModule],
})
export class NavComponent {
  constructor(private router: Router, private authService: AuthService) {}
  // isLoggedin: boolean = false;

  ngOnInit() {
    // this.isLoggedin = this.authService.isAuthenticated();
  }
  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
  
  logout() {
    this.authService.logout(); // Clear session storage and navigate to the auth page
    this.router.navigate(['/auth']); // Redirect to login/auth page
  }

  // Method to check if the user is logged in
  checkIsLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}
