import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, NonNullableFormBuilder, AbstractControl, ValidationErrors, Validator, ValidatorFn, FormGroupDirective, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/interface';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  ngOnInit(): void {
    this.registerForm.value.email;
  }

  constructor(
    private auth: AngularFireAuth,
    private fb: NonNullableFormBuilder,
    private router: Router
  ) { }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get username() {
    return this.registerForm.get('username');
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value;
    if (pass !== confirmPass) {
      group.get('confirmPassword')?.setErrors({ notSame: true });
      return { notSame: true };
    } else {
      return null;
    }
  }

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['']
  }, { validators: this.checkPasswords });

  register() {

    const { username, email, password } = this.registerForm.value;

    if (!this.registerForm.valid || !email || !password || !username)
      return;

    this.auth.createUserWithEmailAndPassword(email, password)
      .then(response => {
        return response.user?.updateProfile({
          displayName: username,
        });
      })
      .then(() => {
        console.log('Registration Successful:', this.auth.currentUser);
        this.router.navigate(['']);
      })
      .catch(error => {
        console.error('Registration Failed:', error);
      })
  }
}


