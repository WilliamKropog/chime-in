import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveComponent } from './collective.component';

describe('CollectiveComponent', () => {
  let component: CollectiveComponent;
  let fixture: ComponentFixture<CollectiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CollectiveComponent]
    });
    fixture = TestBed.createComponent(CollectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
