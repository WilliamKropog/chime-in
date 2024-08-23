import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FeaturedComponent } from './featured/featured.component';
import { FYPComponent } from './fyp/fyp.component';
import { CollectiveComponent } from './collective/collective.component';
import { CommentComponent } from './comment/comment.component';
import { CommentEditorComponent } from './comment-editor/comment-editor.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotToastModule } from '@ngneat/hot-toast';
import { PostEditorComponent } from './post-editor/post-editor.component';
import { getAuth } from 'firebase/auth';
import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';
import { provideAuth } from '@angular/fire/auth';
import { ProfileComponent } from './profile/profile.component';
import { PostComponent } from './post/post.component';
import { HomePostsComponent } from './home-posts/home-posts.component';
import { RelativeTimePipe } from 'src/pipes/relative-time.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SideNavComponent,
    NavbarComponent,
    FeaturedComponent,
    FYPComponent,
    CollectiveComponent,
    CommentComponent,
    CommentEditorComponent,
    CommentListComponent,
    RegisterComponent,
    HomeComponent,
    PostEditorComponent,
    ProfileComponent,
    PostComponent,
    HomePostsComponent,
    RelativeTimePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    RouterModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    HotToastModule.forRoot(),
  ],
  providers: [
    // {provide: APP_BASE_HREF, useValue: '/src/app'},
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())],
  bootstrap: [AppComponent]
})
export class AppModule { }