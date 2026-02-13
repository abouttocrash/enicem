import { Component, inject, signal, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import {  MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { Salida } from '@shared-types/Salida';
import { HttpParams } from '@angular/common/http';
import { ICEMDR } from '@shared-types/ICEMR';
import { MatDialog } from '@angular/material/dialog';
import { APIService } from '../../api.service';
import { AutoIcemComponent, AutoFilter } from '../../components/auto-icem/auto-icem.component';
import { ProyectoService } from '../../proyecto.service';
import { SalidaService } from '../../salida.service';
import { ViewsImports } from '../../utils/Utils';
import { CommonModule } from '@angular/common';
import { TablaSalidasComponent } from '../../tablas/tabla-salidas/tabla-salidas.component';

@Component({
  selector: 'app-vista-salidas',
  providers:[
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  ],
  imports: [...ViewsImports,AutoIcemComponent,CommonModule,TablaSalidasComponent],
  templateUrl: './vista-salidas.component.html',
  styleUrl: './vista-salidas.component.scss'
})
export class VistaSalidasComponent {
  dialog = inject(MatDialog)
  @ViewChild(MatSort) sort!: MatSort;
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  

  tipo = "Ambas"
  status = "Todos"
  fecha1:Date
  fecha2:Date
  filters:Array<AutoFilter>=[
    {
      filter:"Tipo",
      options:[]
    },
    {
      filter:"Creada por",
      options:[]
    },
    {
      filter:"Proyecto",
      options:[]
    },
    {
      filter:"Status",
      options:[]
    },
  ]
  filteredFilters:Array<AutoFilter> = []
  constructor(public s:SalidaService,private api:APIService,private p:ProyectoService){
    this.fecha1 = moment().startOf("month").toDate()
    this.fecha2 = moment().endOf("month").toDate()
  }

  async ngAfterViewInit(){
    this._locale.set('es');
    this._adapter.setLocale(this._locale());
    await this.init()
  }
  //TODO
  initFilters(s:any[]){
    this.filters[0].options = Array.from(new Set(s.map(d=>{return d.tipo})))
    this.filters[1].options = Array.from(new Set(s.map(d=>{return d.usuario})))
    this.filters[2].options = Array.from(new Set(s.map(d=>{return d.project!})))
    this.filters[3].options = Array.from(new Set(s.map(d=>{return d.status!})))
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
  }

  async init(){
     const httpParams = new HttpParams()
    .set("tipo", this.tipo)
    .set("fecha1", moment( this.fecha1.toISOString()).startOf("D").toISOString())
    .set("fecha2", moment( this.fecha2.toISOString()).endOf("D").toISOString());
    const salidas = await this.s.getAllSalidas(httpParams)
    this.createDataSource(salidas)
    this.initFilters(salidas.data)
  }

  

  createDataSource(r:ICEMDR<Salida>){
    this.s.dataSource = new MatTableDataSource(r.data)
    this.s.dataSource.sort = this.sort
  }

  applyFilter(event: Event | string) {
    let filterValue = ""
    if (event instanceof KeyboardEvent) {
      const k = event.key;
      if (/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/i.test(k)) {
        return;
      }
    }
    if(typeof event == "string")
      filterValue = event.trim().toLowerCase();
    else
      filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.s.dataSource.filterPredicate = (data: any, filter: string) => {
      const matchUsuario = data.usuario.toLowerCase().includes(filter);
      const matchTipo = data.tipo.toLowerCase().includes(filter)
      const matchProyecto = data.project!.toLowerCase().includes(filter)
      const matchStatus = data.status!.toLowerCase().includes(filter)
      
      return matchUsuario || matchTipo || matchStatus || matchProyecto
    };
    this.s.dataSource.filter = filterValue;
    this.filteredFilters = this.auto.filterGroup(filterValue)
  }

  async buscar(){
    const httpParams = new HttpParams()
    .set("tipo", this.tipo)
    .set("fecha1", moment( this.fecha1.toISOString()).startOf("D").toISOString())
    .set("fecha2", moment( this.fecha2.toISOString()).endOf("D").toISOString());
    const r = await this.s.getAllSalidas(httpParams)
    this.createDataSource(r)
    this.initFilters(r.data)
  }
  
}
