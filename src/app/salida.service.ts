import { Injectable } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Salida } from '@shared-types/Salida';
import { APIService } from './api.service';
import { ICEMDR } from '@shared-types/ICEMR';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalidaService {
  displayedColumns = ["folio","folioOrden","salidas", "tipo","fechaSalida","usuario","editar",'action', 'pdf']
  dataSource!:MatTableDataSource<Salida>
  private sort!:MatSort
  private route = "out"
  constructor(private api:APIService) { }

  init(data:Salida[],sort?:MatSort){
    this.dataSource = new MatTableDataSource(data);
    if(sort)
      this.sort = sort;
    this.dataSource.sort = this.sort;
  }

  

  async getAllSalidas(filter?:HttpParams){
     return await this.api.GET2<ICEMDR<Salida>>(`${this.route}/outview`,filter)
  }

  async updateSalida(salida:any){
    await this.api.PUT<ICEMDR<Salida>>(`${this.route}/outview`,{salida:salida})
  }
  async updateCantidadSalida(salida:any){
    await this.api.PUT<ICEMDR<Salida>>(`${this.route}/outview/cantidad`,{salida:salida})
  }
}
