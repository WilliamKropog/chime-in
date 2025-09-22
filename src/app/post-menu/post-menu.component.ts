import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from 'src/interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-menu',
  templateUrl: './post-menu.component.html',
  styleUrl: './post-menu.component.css',
  imports: [CommonModule, MatIconModule, MatButtonModule]
})
export class PostMenuComponent {
  @Input() postId!: string;
  @Input() post?: Post;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}
