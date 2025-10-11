import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollieRegisterComponent } from './collie-register.component';

describe('CollieRegisterComponent', () => {
  let component: CollieRegisterComponent;
  let fixture: ComponentFixture<CollieRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollieRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollieRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
