import { Component, inject, signal, ViewChild } from '@angular/core';
import { OrdenesService } from '../ordenes/ordenes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import moment from 'moment'
import { HttpParams } from '@angular/common/http';
import { ICEMDR } from '@shared-types/ICEMR';
import { AutoFilter, AutoIcemComponent } from '../components/auto-icem/auto-icem.component';
@Component({
  selector: 'app-vista-ordenes',
  providers:[
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  ],
  imports: [MatTableModule, MatIconModule, MatSortModule, MatTooltipModule,
    MatSelectModule,FormsModule,AutoIcemComponent,
    MatFormFieldModule,MatInputModule,CdkDropList, CdkDrag,MatDatepickerModule],
  templateUrl: './vista-ordenes.component.html',
  styleUrl: './vista-ordenes.component.scss'
})
export class VistaOrdenesComponent {
  @ViewChild(MatSort) sort!: MatSort;
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  dataSource!:MatTableDataSource<OrdenTrabajo>;
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  displayedColumns = ["createdAt","dateEntrega","status", "dateReal","folio","totalPiezas","proveedor","tipo","project"]
  
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
      filter:"Proveedor",
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
  constructor(public o:OrdenesService){
    this.fecha1 = moment().startOf("month").toDate()
    this.fecha2 = moment().endOf("month").toDate()
  }

  initFilters(ordenes:OrdenTrabajo[]){
    this.filters[0].options = Array.from(new Set(ordenes.map(d=>{return d.tipo})))
    this.filters[1].options = Array.from(new Set(ordenes.map(d=>{return d.proveedor})))
    this.filters[2].options = Array.from(new Set(ordenes.map(d=>{return d.project!})))
    this.filters[3].options = Array.from(new Set(ordenes.map(d=>{return d.status!})))
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
  }
  async ngAfterViewInit(){
    this._locale.set('es');
    this._adapter.setLocale(this._locale());
    const httpParams = new HttpParams()
    .set("tipo", this.tipo)
    .set("status", this.status)
    .set("fecha1", moment( this.fecha1.toISOString()).startOf("D").toISOString())
    .set("fecha2", moment( this.fecha2.toISOString()).endOf("D").toISOString());
    const ordenes = await this.o.getAllOrders(httpParams)
    this.dataSource = new MatTableDataSource(ordenes.data)
    this.dataSource.sort = this.sort
    this.initFilters(ordenes.data)
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
    this.dataSource.filterPredicate = (data: OrdenTrabajo, filter: string) => {
        const matchProveedor = data.proveedor.toLowerCase().includes(filter);
        const matchTipo = data.tipo.toLowerCase().includes(filter)
        const matchProyecto = data.project!.toLowerCase().includes(filter)
        const matchStatus = data.status!.toLowerCase().includes(filter)
        
        return matchProveedor || matchTipo || matchStatus || matchProyecto
    };
    this.dataSource.filter = filterValue;
    this.filteredFilters = this.auto.filterGroup(filterValue)
  }

  async buscar(){
    const httpParams = new HttpParams()
    .set("tipo", this.tipo)
    .set("status",this.status)
    .set("fecha1", moment( this.fecha1.toISOString()).startOf("D").toISOString())
    .set("fecha2", moment( this.fecha2.toISOString()).endOf("D").toISOString());
    const r = await this.o.getAllOrders(httpParams)
    this.initFilters(r.data)
    this.createDataSource(r)
  }
  createDataSource(r:ICEMDR<OrdenTrabajo>){
      this.dataSource = new MatTableDataSource(r.data)
      this.dataSource.sort = this.sort
    }
}
