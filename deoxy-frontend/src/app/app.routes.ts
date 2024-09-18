import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/homePage.component';
import { UserPageComponent } from './pages/user/userPage.component';
import { ManagementPageComponent } from './pages/management/managementPage.component';
import { UploadPageComponent } from './pages/upload/uploadPage.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { AuthGuard } from './guards/auth.guard';



export const routes: Routes = [
  { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
  { path: 'auth', component: AuthPageComponent }, // Login/Register page should not be guarded
  { path: 'user', component: UserPageComponent, canActivate: [AuthGuard]  },
  { path: 'management', component: ManagementPageComponent, canActivate: [AuthGuard]  },
  { path: 'upload', component: UploadPageComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutPageComponent, canActivate: [AuthGuard]  }, 
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];