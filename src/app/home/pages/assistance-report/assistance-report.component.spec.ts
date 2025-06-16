import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistanceReportComponent } from './assistance-report.component';

describe('AssistanceReportComponent', () => {
  let component: AssistanceReportComponent;
  let fixture: ComponentFixture<AssistanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistanceReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssistanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
