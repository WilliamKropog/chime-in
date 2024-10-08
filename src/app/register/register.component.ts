import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Validators, NonNullableFormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { BackgroundService } from 'src/services/background.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements AfterViewInit{

  ngOnInit(): void {
    this.registerForm.value.email;
  }

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private fb: NonNullableFormBuilder,
    private router: Router,
    private backgroundService: BackgroundService,
    private elRef: ElementRef
  ) { }

  ngAfterViewInit(): void {
    const registerElement = this.elRef.nativeElement.querySelector('.register-background');
    this.backgroundService.initBackgroundChanger(registerElement);
  }

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
        const user = response.user;
        return user?.updateProfile({
          displayName: username,
        }).then(() => {
          return this.firestore.collection('users').doc(user?.uid).set({
            username: username,
            email: email,
            bio: '',
            backgroundImageURL: ''
          });
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


