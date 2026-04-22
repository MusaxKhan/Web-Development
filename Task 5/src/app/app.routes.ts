import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { Home } from './home/home';
import { About } from './about/about';
import { Feedback } from './feedback/feedback';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'home',     component: Home },
      { path: 'about',    component: About },
      { path: 'feedback', component: Feedback },
      { path: '',         redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '',   redirectTo: 'dashboard/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard/home' }
];