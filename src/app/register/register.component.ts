import { Component, AfterViewInit, ElementRef, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Validators, NonNullableFormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user.service';

interface Bubble {
  id: number;
  size: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false,
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('bubbleField', { static: true }) bubbleField!: ElementRef<HTMLElement>;

  recommendedProfiles: any[] = [];
  bubbles: Bubble[] = [];

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private fb: NonNullableFormBuilder,
    private router: Router,
    private userService: UserService,
    private host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.registerForm.value.email;
    this.loadRecommendedProfiles(1);
  }

  ngAfterViewInit(): void {
    this.generateBubbles(30);
  }

  private generateBubbles(count: number): void {
    const host = this.bubbleField?.nativeElement;
    if (!host) return;

    const { width, height } = host.getBoundingClientRect();

    const MIN = 48; 
    const MAX = 240; 

    const next: Bubble[] = [];
    
    for (let i = 0; i < count; i++) {
      const size = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
      const left = Math.floor(Math.random() * (Math.max(0, Math.floor(width - size)) + 1));
      const top = Math.floor(Math.random() * (Math.max(0, Math.floor(height - size)) + 1));
      const delay = +(Math.random() * 0.9).toFixed(2); 
      const duration = +(1.2 + Math.random() * 1.6).toFixed(2); 

      next.push({ id: i, size, left, top, delay, duration });
    } 
    this.bubbles = next;
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

