import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsColumnComponent } from './news-column.component';

describe('NewsColumnComponent', () => {
  let component: NewsColumnComponent;
  let fixture: ComponentFixture<NewsColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsColumnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
