import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoScrapComponent } from './dialogo-scrap.component';

describe('DialogoScrapComponent', () => {
  let component: DialogoScrapComponent;
  let fixture: ComponentFixture<DialogoScrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoScrapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoScrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
