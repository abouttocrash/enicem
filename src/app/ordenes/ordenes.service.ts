import { Injectable } from '@angular/core';
import { APIService } from '../api.service';
import { ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { OrdenTrabajo, StatusOrden } from '@shared-types/OrdenTrabajo';
import { Pieza } from '@shared-types/Pieza';
import { MILESTONE_DESC } from '@shared-types/Bitacora';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ProyectoService } from '../proyecto.service';

@Injectable({
  providedIn: 'root'
})
export class OrdenesService {
  private sort!:MatSort
  currentOrden!:OrdenTrabajo
  piezasEnPanel:Array<Pieza> = []
  displayedColumns: string[] = ['folio','tipo','totalPiezas','proveedor','creada', 'dateEntrega','status','dateReal'];
  dataSource!: MatTableDataSource<OrdenTrabajo>;
  constructor(private api:APIService) {}

  init(data:OrdenTrabajo[],sort?:MatSort){
    this.dataSource = new MatTableDataSource(data);
    if(sort)
      this.sort = sort;
    this.dataSource.sort = this.sort;
  
  }

  async getOrders(){
    const r = await this.api.GET<ICEMDR<OrdenTrabajo>>("order/all",{attr:"projectId",value:this.api.currentProject._id!})
    r.data.forEach(o=>{
      o.proveedor = this.api.proveedores.find(p=>{return p._id == o.idProveedor})!.name
    })
    this.dataSource = new MatTableDataSource(r.data);
    this.dataSource.sort = this.sort;
    return r
  }

  async getOrder(_id:string){
    const r = await this.api.GET<ICEMR<OrdenTrabajo>>("order/",{attr:"orderId",value:_id!})
    r.data.proveedor = this.api.proveedores.find(p=>{return p._id == r.data.idProveedor})!.name
    
    return r.data
  }

  async aprobar(result:{razon:string,bool:boolean,piezas:Pieza[]},idCatalogo:string){
    this.currentOrden.piezas = this.piezasEnPanel
    let recibidas = 0
    const what:Array<string> = []
    this.currentOrden.piezas.forEach(p=>{
      const pieza = result.piezas.find(pi=>{return p.title == pi.title}) 
      if(pieza != undefined){
        recibidas += pieza.cantidadInDialog!
        p.razonRechazo = result.razon
        p.cantidadRecibida.push(pieza.cantidadInDialog!)
        what.push(`${pieza.cantidadInDialog} Piezas recibidas ${pieza.title} | ${pieza.material} | ${pieza.acabado}`)
      }
    })

    await this.api.updateOrder(this.currentOrden,"RECIBIDA")
    const cual = this.currentOrden.tipo == "Detalle" ? "cantidadDetalle":"cantidadManufactura"
    await this.api.updateCatalogo(cual,this.currentOrden.piezas,idCatalogo)
    const desc =  `(${recibidas}) Piezas recibidas para orden de ${this.currentOrden.tipo} #${this.currentOrden.folio}`
    await this.api.updateLog({description:desc,generalId:this.currentOrden._id,createdBy:this.api.currentUser._id,expand:true,what:what})
    const r = await this.api.getOrder(this.currentOrden._id)
    this.currentOrden = r.data
    this.piezasEnPanel = JSON.parse(JSON.stringify(this.currentOrden.piezas))
    
  }

  async rechazar(result:{razon:string,bool:boolean,piezas:Pieza[]},idCatalogo:string){
    this.currentOrden.piezas = this.piezasEnPanel
    const what:Array<string> = []
    let recibidas = 0
    this.currentOrden.piezas.forEach(p=>{
      const pieza = result.piezas.find(pi=>{return p.title == pi.title}) 
      if(pieza != undefined){
        recibidas += pieza.cantidadInDialog!
        p.razonRechazo = result.razon
        p.cantidadRechazada?.push(pieza.cantidadInDialog!)
        what.push(`${pieza.cantidadInDialog} Piezas recibidas ${pieza.title} | ${pieza.material} | ${pieza.acabado} | ${result.razon}`)
      }
    })
    await this.api.updateOrder(this.currentOrden,"RECHAZADA")
   const desc =  `(${recibidas}) Piezas rechazadas para orden de ${this.currentOrden.tipo} #${this.currentOrden.folio} Razón: ${result.razon}`
    await this.api.updateLog({description:desc +" Folio #"+this.currentOrden.folio,generalId:this.currentOrden._id,createdBy:this.api.currentUser._id,expand:true,what:what})
    const r = await this.api.getOrder(this.currentOrden._id)
    this.currentOrden = r.data
    this.piezasEnPanel = JSON.parse(JSON.stringify(this.currentOrden.piezas))
  }

  async actualizarStatus(status:StatusOrden){
    await this.api.updateOrderStatus(this.currentOrden._id,status)
    const desc = this.currentOrden.tipo == "Detalle" ? "ORDEN DETALLE "+status : "ORDEN MAQUINADO "+status
     await this.api.updateLog({description:desc +" Folio #"+this.currentOrden.folio,generalId:this.currentOrden._id,createdBy:this.api.currentUser._id,expand:true})
    this.currentOrden.status = status
  }
}
