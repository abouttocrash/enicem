import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRechazoComponent } from './dialog-rechazo.component';

describe('DialogRechazoComponent', () => {
  let component: DialogRechazoComponent;
  let fixture: ComponentFixture<DialogRechazoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRechazoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRechazoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
