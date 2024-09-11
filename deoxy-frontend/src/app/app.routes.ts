import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/homePage.component';
import { UserPageComponent } from './pages/user/userPage.component';
import { ManagementPageComponent } from './pages/management/managementPage.component';
import { UploadPageComponent } from './pages/upload/uploadPage.component';



export const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'user', component: UserPageComponent },
  { path: 'management', component: ManagementPageComponent },
  {path: 'upload', component: UploadPageComponent},

  { path: '', redirectTo: '/home', pathMatch: 'full' } // Default route
];
