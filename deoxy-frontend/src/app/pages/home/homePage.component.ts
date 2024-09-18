import { Component } from '@angular/core';
import { Router } from '@angular/router'; // To navigate to other pages
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.css'], // Optional for styling
  imports: [CarouselModule, CommonModule]

})
export class HomePageComponent {

  images = [
   "assets/testImage1.jpeg",
   "assets/testImage2.jpeg",
   "assets/testImage3.jpeg",
  ];

  carouselOptions = {
    loop: true,
    margin: 10,
    nav: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 },
      1200: { items: 4 }
    }
  };
  constructor(private router: Router) {}

  // Method to navigate to different pages
  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
