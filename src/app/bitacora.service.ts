import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { APIService } from './api.service';
import { ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { Bitacora, Milestone } from '@shared-types/Bitacora';
import { MatSort } from '@angular/material/sort';
import { AutoFilter } from './components/auto-icem/auto-icem.component';
import { Pieza } from '@shared-types/Pieza';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  currentPieza!:Pieza | undefined
  bitacoraPieza!:any[]
  filters:Array<AutoFilter>=[
    // {
    //   filter:"Milestone",
    //   options:[]
    // },
    {
      filter:"Proveedor",
      options:[]
    },
    {
      filter:"Planos",
      options:[]
    },
    {
      filter:"Usuario",
      options:[]
    }
    
  ]
  filteredFilters:Array<AutoFilter> = []
  private route = "logs"
  private projectId!:string
  private sort!:MatSort
  displayedColumns: string[] = ['description','usuario','proveedor', 'createdAt', 'expand'];
  dataSource!: MatTableDataSource<Milestone>;
  constructor(private api:APIService) { 
    
  }

  init(data:Bitacora,sort?:MatSort){
    this.dataSource = new MatTableDataSource(data.milestones);
    if(sort)
      this.sort = sort;
    this.dataSource.sort = this.sort;

    //this.filters[0].options = Array.from(new Set(data.milestones.map(d=>{return d.description})))
    this.filters[0].options = Array.from(new Set(data.milestones.map(d=>{return d.proveedor as unknown as string}))).filter(o=>{return o != "-"})
    this.filters[1].options = Array.from(new Set(
      data.milestones
        .flatMap(d => d.what)
        .map(p => p?.plano)
        .filter((p): p is string => p != null)
    )).filter(o=>{return o != undefined})
    this.filters[2].options = Array.from(new Set(data.milestones.map((d:any)=>{return d.usuario}))).filter(o=>{return o != undefined})
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
  }

  async getLog(){
    const r = await this.api.GET<ICEMR<Bitacora>>(this.route,{attr:"projectId",value:this.projectId})
    this.dataSource = new MatTableDataSource(r.data.milestones);
    this.dataSource.sort = this.sort;
    return r
  }
}
