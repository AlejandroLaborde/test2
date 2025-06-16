import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAssistanceComponent } from './manage-assistance.component';

describe('ManageAssistanceComponent', () => {
  let component: ManageAssistanceComponent;
  let fixture: ComponentFixture<ManageAssistanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAssistanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageAssistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
