import { Injectable } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { APIService } from './api.service';
import { ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { Catalogo, Pieza } from '@shared-types/Pieza';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private route = "catalog"
  catalogId!:string
  private sort!:MatSort
  displayedColumns: string[] = ['box','title','material','acabado','piezas','cantidadManufactura','cantidadDetalle','cantidadAlmacen','expand'];
  dataSource!: MatTableDataSource<Pieza>;
  constructor(private api:APIService) { }

  init(data:Catalogo,sort?:MatSort){
    this.dataSource = new MatTableDataSource(data.logs);
    if(sort)
      this.sort = sort;
    this.dataSource.sort = this.sort;
  }
  async createAlmacen(piezas:Pieza[]){
    const body = {
      piezas:piezas,
      catalogId:this.catalogId
    }
    let total = 0
    const what:Array<string> = []
    piezas.forEach(p=>{
      total += Number(p.cantidadInDialog) || 0
      what.push(`${p.cantidadInDialog} ${p.title}`)
    })
    const r = await this.api.POST<ICEMR<any>>(this.route+"/almacen",body) as any
    const desc = `(${total}) Piezas a almacen`
    await this.api.updateLog({description:desc ,generalId:r.inserted.insertedId,createdBy:this.api.currentUser._id,expand:true,what})
    
  }

  async getCatalog(){
    const r = await this.api.GET<ICEMR<any>>(this.route,{attr:"catalogId",value:this.catalogId})
    this.dataSource = new MatTableDataSource(r.data.logs);
    this.dataSource.sort = this.sort;
    return r
  }
}
