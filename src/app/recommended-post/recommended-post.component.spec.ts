import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedPostComponent } from './recommended-post.component';

describe('RecommendedPostComponent', () => {
  let component: RecommendedPostComponent;
  let fixture: ComponentFixture<RecommendedPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedPostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecommendedPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
