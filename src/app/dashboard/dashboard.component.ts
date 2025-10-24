import { Component, inject, signal } from '@angular/core';
import { APIService } from '../api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../users-module/User';
import { HttpParams } from '@angular/common/http';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dashboard',
  providers:[
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  ],
  imports: [MatFormFieldModule,MatSelectModule, MatDatepickerModule,FormsModule,MatInputModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  proveedorObj!:User
   private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
   fecha1:Date
  fecha2:Date
  constructor(public api:APIService){
     this.fecha1 = moment().startOf("month").toDate()
        this.fecha2 = moment().endOf("month").toDate()
  }
  async ngAfterViewInit(){
    this._locale.set('es');
    this._adapter.setLocale(this._locale());
    await this.api.getProveedores()
    
  }
  selectProveedor(p:User){
    this.proveedorObj = p
  }
  async reporter1(){
    const httpParams = new HttpParams()
    .set("fecha1", moment( this.fecha1.toISOString()).startOf("D").toISOString())
    .set("fecha2", moment( this.fecha2.toISOString()).endOf("D").toISOString());
    const r = await this.api.GET2("report",httpParams) as any
    const url = r.data.path;
    window.open(url, '_blank');
  }

   async reporteProveedor(){
    const params = new HttpParams()
    .set("proveedor",this.proveedorObj._id!)
    .set("fecha1", moment( this.fecha1.toISOString()).startOf("D").toISOString())
    .set("fecha2", moment( this.fecha2.toISOString()).endOf("D").toISOString());
    const r = await this.api.GET2(`report/proveedor`,params) as any
    const url = r.data.path;
    window.open(url, '_blank');
    return r
  }
}
