import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import {NavComponent} from './components/nav/nav.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [NavComponent, CommonModule, RouterModule, CarouselModule] // Add necessary imports if needed
})
export class AppComponent implements OnInit {
  message: string = '';
  activeComponent: string = 'home'; // Default component is 'home'

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    
  }

  // Update the active component based on the event emitted by NavComponent
  onComponentSelected(component: string) {
    this.activeComponent = component;
  }
}
