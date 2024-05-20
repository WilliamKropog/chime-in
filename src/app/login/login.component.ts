import { Component, OnInit } from '@angular/core';
import { Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthenticationService } from 'src/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  ngOnInit(): void {
    this.loginForm.value.email;
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toast: HotToastService,
    private fb: NonNullableFormBuilder,
  ) { }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async submit() {
    const { email, password } = this.loginForm.value;

    if (!this.loginForm.valid || !email || !password)
      return;

    (await this.authService.login(email, password).then(
      this.toast.observe({
        success: '',
        loading: '',
        error: '',
      })
    )).subscribe(() => {
      this.router.navigate(['']);
    });


  }



}
//Recent Login

// this.authService.login(email, password).pipe(
//   this.toast.observe({
//     success: 'Logged in successfully',
//     loading: 'Logging in...',
//     error: 'Login Error'
//   })
// ).subscribe(() => {
//   this.router.navigate(['']);
// });

