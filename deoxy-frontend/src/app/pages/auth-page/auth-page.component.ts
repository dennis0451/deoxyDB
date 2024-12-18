import { Component } from '@angular/core';
import { LoginComponent } from '../../login/login.component';
import { RegisterComponent } from '../../register/register.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [LoginComponent, RegisterComponent, CommonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})

export class AuthPageComponent {
  isLoginMode = true; // Toggle between login and registration
  username: string = '';
  password: string = '';
  confirmPassword: string = ''; // For registration
  email: string = ''; // Only for registration
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('is logged in?', this.isLoginMode);
  }
    
  toggleAuthMode() {
    this.isLoginMode = !this.isLoginMode;
  
    // Clear or reset form fields as necessary when switching modes
    if (this.isLoginMode) {
      this.confirmPassword = '';
      this.email = '';
      this.errorMessage = '';
    } else {
      this.password = '';
      this.errorMessage = '';
    }
  }
  

  onSubmit() {
    if (!this.username || !this.password || (!this.isLoginMode && (!this.email || !this.confirmPassword))) {
      this.errorMessage = 'Please fill out all fields.';
      return;
    }

    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }

  login() {
    const credentials = { username: this.username, password: this.password };

    this.authService.login(credentials).subscribe(
      (response) => {
        this.router.navigate(['/home']);
      },
      (error) => {
        this.errorMessage = 'Login failed';
      }
    );
  }

  register() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const user = { username: this.username, email: this.email, password: this.password };

    this.authService.register(user).subscribe(
      (response) => {
        this.errorMessage = '';  // Clear any error message
        this.isLoginMode = true; // Switch to login after successful registration
      },
      (error) => {
        this.errorMessage = 'Registration failed';
      }
    );
  }
}
