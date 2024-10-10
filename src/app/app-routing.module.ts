import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FeaturedComponent } from './featured/featured.component';
import { FYPComponent } from './fyp/fyp.component';
import { CollectiveComponent } from './collective/collective.component';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent, 
    pathMatch: 'full'
  },
  { 
    path: 'featured', 
    component: FeaturedComponent 
  },
  { 
    path: 'fyp', 
    component: FYPComponent
  },
  { 
    path: 'collective', 
    component: CollectiveComponent
  },
  { 
    path: 'register', 
    component: RegisterComponent
  },
  { 
    path: 'profile', 
    component: ProfileComponent
  },
  {
    path: 'profile/:username', component: ProfileComponent
  },
  {
    path: '**', redirectTo: '', pathMatch: 'full'
  }
  // ... other routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Configure the routes using forRoot
  exports: [RouterModule], // Export RouterModule for use in other modules
})
export class AppRoutingModule {}