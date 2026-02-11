import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OrdenesService } from '../../ordenes/ordenes.service';
import { Proveedor } from '@shared-types/Proveedor';
import { APIService } from '../../api.service';

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
  proveedorObj!:Proveedor
  todayDate:Date = new Date();
  filteredProveedores:Proveedor[] = []
  data = inject(MAT_DIALOG_DATA) as "Detalle" |"Maquinado" | "Ambos"
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  constructor(private ref:MatDialogRef<CambioFechaComponent>,private o:OrdenesService,private api:APIService){
    console.log(this.data)
    this.filteredProveedores = api.proveedores.filter(p=>{return p.tipo == this.data || p.tipo == "Ambos"})
    this.proveedorObj = api.proveedores.find(p=>{return p._id == this.o.currentOrden?.idProveedor})!
    this._locale.set('es');
    this._adapter.setLocale(this._locale());
     this.form = new FormGroup({
      razon: new FormControl("", [Validators.required]),
      proveedor:new FormControl(this.o.currentOrden!.proveedor,[ Validators.required]),
      date:new FormControl(new Date( this.o.currentOrden!.dateEntrega),[Validators.required])
    });
  }

  close(bool:boolean){
    const body = {
      razon:this.form.get("razon")?.value!,
      date:this.form.get("date")!.value!,
      proveedor:this.proveedorObj
    }
    this.ref.close({bool:bool,body:body})
  }
  selectProveedor(p:Proveedor){
    this.proveedorObj = p
  }
}
