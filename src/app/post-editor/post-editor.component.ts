import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css']
})
export class PostEditorComponent {
  @Input() isVisible: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  postText: string = '';
  characterCount: number = 0;

  user$ = this.authService.currentUser$;

  constructor(
    private authService: AuthenticationService,
  ){}

  updateCharacterCount(): void{
    this.characterCount = this.postText.length;
  }

  updatePostText(value: string): void{
    this.postText = value;
    this.updateCharacterCount();
  }

  onClose(): void{
    this.isVisible = false;
    this.close.emit();
  }
}
