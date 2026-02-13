import { Component, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Salida } from '@shared-types/Salida';
import { CommonModule } from '@angular/common';
import { APIService } from '../../../api.service';
import { AutoIcemComponent, AutoFilter } from '../../../components/auto-icem/auto-icem.component';
import { ProyectoService } from '../../../proyecto.service';
import { SalidaService } from '../../../salida.service';
import { TablaSalidasComponent } from '../../../tablas/tabla-salidas/tabla-salidas.component';
@Component({
  selector: 'tab-salidas',
  imports: [
    MatTableModule, MatIconModule, MatFormFieldModule,
    AutoIcemComponent,
    MatInputModule,CommonModule,TablaSalidasComponent
  ],
  templateUrl: './tab-salidas.component.html',
  styleUrl: './tab-salidas.component.scss'
})
export class SalidasComponent {
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  @ViewChild(TablaSalidasComponent) tablaSalidas!:TablaSalidasComponent
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
  constructor(public s:SalidaService,private api:APIService,private p:ProyectoService){}

  init(data:Salida[]){
    data.forEach((d:any)=>{
      if(d.project == undefined)
        d.project = this.api.currentProject.name
    })
    const r = this.s.init(data,this.tablaSalidas.sort)
    this.initFilters(data)
    
  }

  //TODO
  initFilters(s:any[]){
    this.filters[0].options = Array.from(new Set(s.map(d=>{return d.tipo})))
    this.filters[1].options = Array.from(new Set(s.map(d=>{return d.usuario})))
    this.filters[2].options = Array.from(new Set(s.map(d=>{return d.project!})))
    this.filters[3].options = Array.from(new Set(s.map(d=>{return d.status!})))
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
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
}
