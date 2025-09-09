import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Validators, NonNullableFormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { BackgroundService } from 'src/services/background.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent implements AfterViewInit {

  recommendedProfiles: any[] = [];

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private fb: NonNullableFormBuilder,
    private router: Router,
    private backgroundService: BackgroundService,
    private elRef: ElementRef,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.registerForm.value.email;
    this.loadRecommendedProfiles(1);
  }

  ngAfterViewInit(): void {
    const registerElement = this.elRef.nativeElement.querySelector('.register-background');
    this.backgroundService.initBackgroundChanger(registerElement);
  }

  loadRecommendedProfiles(count: number): void {
    this.recommendedProfiles = [];
    for (let i = 0; i < count; i++) {
      this.userService.getRandomRecommendedUser().subscribe(user => {
        if (user) {
          this.recommendedProfiles.push(user);
        }
      });
    }
  }

  get email()     { return this.registerForm.get('email'); }
  get password()  { return this.registerForm.get('password'); }
  get username()  { return this.registerForm.get('username'); }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    if (pass !== confirmPass) {
      group.get('confirmPassword')?.setErrors({ notSame: true });
      return { notSame: true };
    }
    return null;
  };

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['']
  }, { validators: this.checkPasswords });

  async register() {
    const { username, email, password } = this.registerForm.value;

    if (!this.registerForm.valid || !email || !password || !username) return;

    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);

      if (cred.user) {
        await updateProfile(cred.user, { displayName: username });
      }

      const uid = cred.user?.uid as string;
      await setDoc(doc(this.firestore, 'users', uid), {
        username,
        email,
        bio: '',
        backgroundImageURL: ''
      });

      console.log('Registration Successful:', this.auth.currentUser);
      this.router.navigate(['']);
    } catch (error) {
      console.error('Registration Failed:', error);
    }
  }
}
