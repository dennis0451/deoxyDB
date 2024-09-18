import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [MatFormFieldModule, MatInputModule, FormsModule, CommonModule],
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  register() {
    const user = { username: this.username, email: this.email, password: this.password };

    this.apiService.register(user).subscribe(
      (response) => {
        console.log('Registration successful', response);
        this.router.navigate(['/auth']); // Redirect to login
      },
      (error) => {
        this.errorMessage = 'Registration failed';
      }
    );
  }
}