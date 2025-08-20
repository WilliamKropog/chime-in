import { Component, OnInit } from '@angular/core';
import { Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthenticationService } from 'src/services/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
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
  
    if (!this.loginForm.valid || !email || !password) return;

    try {
      await this.authService.login(email, password);
      this.toast.success('Logged in successfully');
      this.router.navigate(['']).then(() => {
        window.location.reload();
      });
    } catch (error) {
      this.toast.error('Login Error');
      console.error('Error logging in:', error);
    }
  }

  // predev 3.7.0 SUBMIT LOGIN
  // async submit() {
  //   const { email, password } = this.loginForm.value;

  //   if (!this.loginForm.valid || !email || !password)
  //     return;

  //   (await this.authService.login(email, password).then(
  //     this.toast.observe({
  //       success: '',
  //       loading: '',
  //       error: '',
  //     })
  //   )).subscribe(() => {
  //     this.router.navigate(['']);
  //   });
  // }

}

