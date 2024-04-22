import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FYPComponent } from './fyp.component';

describe('FYPComponent', () => {
  let component: FYPComponent;
  let fixture: ComponentFixture<FYPComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FYPComponent]
    });
    fixture = TestBed.createComponent(FYPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
