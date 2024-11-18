import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFollowingPostsComponent } from './not-following-posts.component';

describe('NotFollowingPostsComponent', () => {
  let component: NotFollowingPostsComponent;
  let fixture: ComponentFixture<NotFollowingPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFollowingPostsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotFollowingPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
