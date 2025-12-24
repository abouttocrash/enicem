import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OrdenesService } from '../../ordenes/ordenes.service';

@Component({
  selector: 'app-cambio-fecha',
  providers:[
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  ],
  imports: [MatIconModule, ReactiveFormsModule,FormsModule,
     CommonModule, MatInputModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatDatepickerModule, ReactiveFormsModule],
  templateUrl: './cambio-fecha.component.html',
  styleUrl: './cambio-fecha.component.scss'
})
export class CambioFechaComponent {
  form!:FormGroup
  todayDate:Date = new Date();
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  constructor(private ref:MatDialogRef<CambioFechaComponent>,private o:OrdenesService){
   
    this._locale.set('es');
    this._adapter.setLocale(this._locale());
     this.form = new FormGroup({
      razon: new FormControl("", [Validators.required]),
      date:new FormControl(new Date( this.o.currentOrden!.dateEntrega),[Validators.required])
    });
  }

  close(bool:boolean){
    const body = {
      razon:this.form.get("razon")?.value!,
      date:this.form.get("date")!.value!
    }
    this.ref.close({bool:bool,body:body})
  }
}
