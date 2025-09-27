import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BARComponent } from './bar.component';

describe('BARComponent', () => {
  let component: BARComponent;
  let fixture: ComponentFixture<BARComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BARComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BARComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
