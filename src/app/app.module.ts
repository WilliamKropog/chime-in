import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFunctions, getFunctions, connectFunctionsEmulator } from '@angular/fire/functions';
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
import { NewsColumnComponent } from './news-column/news-column.component';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotToastModule } from '@ngneat/hot-toast';
import { PostEditorComponent } from './post-editor/post-editor.component';
import { ProfileEditorComponent } from './profile-editor/profile-editor.component';
import { ProfileComponent } from './profile/profile.component';
import { PostComponent } from './post/post.component';
import { PostPageComponent } from './post-page/post-page.component';
import { HomePostsComponent } from './home-posts/home-posts.component';
import { ProfilePostsComponent } from './profile-posts/profile-posts.component';
import { FollowingPostsComponent } from './following-posts/following-posts.component';
import { NotFollowingPostsComponent } from './not-following-posts/not-following-posts.component';
import { RecommendedProfileComponent } from './recommended-profile/recommended-profile.component';
import { RecommendedPostComponent } from './recommended-post/recommended-post.component';
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
    NewsColumnComponent,
    PostEditorComponent,
    ProfileEditorComponent,
    ProfileComponent,
    PostComponent,
    PostPageComponent,
    HomePostsComponent,
    ProfilePostsComponent,
    FollowingPostsComponent,
    NotFollowingPostsComponent,
    RecommendedProfileComponent,
    RecommendedPostComponent,
    RelativeTimePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideFunctions(() => getFunctions(getApp(), 'us-central1'))],
  bootstrap: [AppComponent]
})
export class AppModule { }