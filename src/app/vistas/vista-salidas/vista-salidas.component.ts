import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import {  MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { Salida } from '@shared-types/Salida';
import { HttpParams } from '@angular/common/http';
import { ICEMDR } from '@shared-types/ICEMR';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { createMilestone } from '@shared-types/Bitacora';
import { APIService } from '../../api.service';
import { AutoIcemComponent, AutoFilter } from '../../components/auto-icem/auto-icem.component';
import { DialogEditarSalidaComponent } from '../../dialog-editar-salida/dialog-editar-salida.component';
import { DialogSalidaComponent } from '../../dialog-salida/dialog-salida.component';
import { ProyectoService } from '../../proyecto.service';
import { SalidaService } from '../../salida.service';
import { ViewsImports, longDialog, createWhat, baseDialog } from '../../utils/Utils';

@Component({
  selector: 'app-vista-salidas',
  providers:[
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  ],
  imports: [...ViewsImports,AutoIcemComponent],
  templateUrl: './vista-salidas.component.html',
  styleUrl: './vista-salidas.component.scss'
})
export class VistaSalidasComponent {
  dialog = inject(MatDialog)
  @ViewChild(MatSort) sort!: MatSort;
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  dataSource!:MatTableDataSource<Salida>;
  displayedColumns = ["tipo","fechaSalida","folio","folioOrden","salidas","usuario","project","status","editar",'action', 'pdf']
  

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

  async abrirDialogoSalida(salida:any){
    if(salida.tipo == "Integración" && salida.status == "ABIERTA"){
      const dialog = this.dialog.open(DialogSalidaComponent,{
        ...longDialog,
        data: JSON.parse(JSON.stringify(salida))
      });
      const r = await firstValueFrom(dialog.afterClosed())
      if(r.bool ){
        r.data.modifiedBy = this.api.currentUser.name
        r.data.modifiedById = this.api.currentUser._id
        r.data.modifiedDate = moment().endOf("D").toISOString()
        await this.s.updateSalida(r.data)
        const desc = `Salida con Folio #${r.data.folio} ${r.data.status} por ${this.api.currentUser.name}`
        const what = createWhat(r.data.salidas,"piezas")
        await this.api.updateLog(createMilestone(desc,r.data._id,this.api.currentUser._id!,what,""))
        
        if(r.data.status == "APROBADA"){
        const bodyStock = {
          piezas:what,
          catalogId:this.api.currentProject.catalogId!,
          razon:"SALIDA Integracion"
        }
     
        await this.api.updateStock(bodyStock)
        } 
        
        await this.init()
      }
    }
    
  }

  createDataSource(r:ICEMDR<Salida>){
    this.dataSource = new MatTableDataSource(r.data)
    this.dataSource.sort = this.sort
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
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
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const matchUsuario = data.usuario.toLowerCase().includes(filter);
      const matchTipo = data.tipo.toLowerCase().includes(filter)
      const matchProyecto = data.project!.toLowerCase().includes(filter)
      const matchStatus = data.status!.toLowerCase().includes(filter)
      
      return matchUsuario || matchTipo || matchStatus || matchProyecto
    };
    this.dataSource.filter = filterValue;
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

  //TODO
  canApprove(){
    if(this.api.currentUser == undefined) return false
    return this.api.currentUser.actions.includes("APROBAR_ALMACEN")
  }
  //TODO
  async getPDF(salida:Salida){
    let x = salida as any
    x.idProject = this.api.currentProject._id
    const body = {
      salida:x
    }
    const r = await this.api.POST<any>("pdf/salida",body)
    window.open(r.data.path, '_blank');
  }

  async editarSalida(salida:any){
      const dialog = this.dialog.open(DialogEditarSalidaComponent,{
        ...baseDialog,
        data: JSON.parse(JSON.stringify(salida))
      });
      const r = await firstValueFrom(dialog.afterClosed())
      if(r.bool ){
        r.data.modifiedBy = this.api.currentUser.name
        r.data.modifiedById = this.api.currentUser._id
        r.data.modifiedDate = moment().endOf("D").toISOString()
        await this.s.updateCantidadSalida(r.data)
        const desc = `(Nuevas cantidades) Salida con Folio ${r.data.folio} Modificada por ${this.api.currentUser.name}`
        const what = createWhat(r.data.salidas,"piezas")
        await this.api.updateLog(createMilestone(desc,r.data._id,this.api.currentUser._id!,what,""))
        await this.p.getAll()
      }
  }
  
}
