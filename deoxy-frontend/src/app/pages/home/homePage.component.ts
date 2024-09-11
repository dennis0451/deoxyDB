import { Component } from '@angular/core';
import { Router } from '@angular/router'; // To navigate to other pages

@Component({
  selector: 'app-home-page',
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.css'] // Optional for styling
})
export class HomePageComponent {

  constructor(private router: Router) {}

  // Method to navigate to different pages
  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
