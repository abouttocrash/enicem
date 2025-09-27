import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalidaAlmacenComponent } from './salida-almacen.component';

describe('SalidaAlmacenComponent', () => {
  let component: SalidaAlmacenComponent;
  let fixture: ComponentFixture<SalidaAlmacenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalidaAlmacenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalidaAlmacenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
