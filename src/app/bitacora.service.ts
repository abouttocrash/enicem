import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { APIService } from './api.service';
import { ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { Bitacora } from '@shared-types/Bitacora';
import { MatSort } from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private route = "logs"
  private projectId!:string
  private sort!:MatSort
  displayedColumns: string[] = ['description','usuario','createdAt', 'expand'];
  dataSource!: MatTableDataSource<any>;
  constructor(private api:APIService) { 
    
  }

  init(data:Bitacora,sort?:MatSort){
    this.dataSource = new MatTableDataSource(data.milestones);
    if(sort)
      this.sort = sort;
    this.dataSource.sort = this.sort;
  }

  async getLog(){
    const r = await this.api.GET<ICEMR<Bitacora>>(this.route,{attr:"projectId",value:this.projectId})
    this.dataSource = new MatTableDataSource(r.data.milestones);
    this.dataSource.sort = this.sort;
    return r
  }
}
