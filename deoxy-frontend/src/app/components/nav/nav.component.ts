import { Router } from '@angular/router';
import { Component, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule],
})
export class NavComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
