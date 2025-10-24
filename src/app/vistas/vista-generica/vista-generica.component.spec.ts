import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaGenericaComponent } from './vista-generica.component';

describe('VistaGenericaComponent', () => {
  let component: VistaGenericaComponent;
  let fixture: ComponentFixture<VistaGenericaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaGenericaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaGenericaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
