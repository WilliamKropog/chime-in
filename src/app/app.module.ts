import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { authState, Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FeaturedComponent } from './featured/featured.component';
import { FYPComponent } from './fyp/fyp.component';
import { CollectiveComponent } from './collective/collective.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotToastModule } from '@ngneat/hot-toast';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SideNavComponent,
    NavbarComponent,
    FeaturedComponent,
    FYPComponent,
    CollectiveComponent,
    RegisterComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, 
    RouterModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    HotToastModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

