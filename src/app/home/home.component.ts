import { Component } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostEditorComponent } from '../post-editor/post-editor.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor (public authService: AuthenticationService){
    
  }

}
