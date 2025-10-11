import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaOrdenesComponent } from './vista-ordenes.component';

describe('VistaOrdenesComponent', () => {
  let component: VistaOrdenesComponent;
  let fixture: ComponentFixture<VistaOrdenesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaOrdenesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaOrdenesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
