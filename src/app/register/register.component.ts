import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private auth: AngularFireAuth) {}

  register(){
    this.auth.createUserWithEmailAndPassword(this.email, this.password)
      .then(response => {
        return response.user?.updateProfile({
          displayName: this.username,
        });
      })
      .then(() => {
        console.log('Registration Successful:', this.auth.currentUser);
      })  
      .catch(error => {
        console.error('Registration Failed:', error);
      })
  }
}
