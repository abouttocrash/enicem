import { inject, Injectable } from '@angular/core';
import { APIService } from '../api.service';
import { ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { OrdenTrabajo, StatusOrden } from '@shared-types/OrdenTrabajo';
import { Pieza } from '@shared-types/Pieza';
import { createMilestone, MILESTONE_DESC, What } from '@shared-types/Bitacora';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { User } from '../users-module/User';
import { AutoFilter } from './ordenes-trabajo/ordenes-trabajo.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createWhat } from '../utils/Utils';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class OrdenesService {
  http = inject(HttpClient)
  images:Array<string> = []
  filters:Array<AutoFilter>=[
      {
        filter:"Status",
        options:[]
      },
      {
        filter:"Tipo",
        options:[]
      },
      {
        filter:"Proveedor",
        options:[]
      },
      {
        filter:"Planos",
        options:[]
      }
  
  ]
  filteredFilters:Array<AutoFilter> = []
  private sort!:MatSort
  drawer!:MatDrawer
  currentOrden!:OrdenTrabajo
  piezasEnPanel:Array<Pieza> = []
  displayedColumns: string[] = ['folio','tipo','totalPiezas','proveedor','creada', 'dateEntrega','status','dateReal','cantidadRecibida','cantidadRechazada'];
  dataSource!: MatTableDataSource<OrdenTrabajo>;
  constructor(private api:APIService) {}

  init(data:OrdenTrabajo[],drawer?:MatDrawer,sort?:MatSort){
    if(drawer)
      this.drawer = drawer
    this.dataSource = new MatTableDataSource(data);
    if(sort)
      this.sort = sort;
    this.dataSource.sort = this.sort;
    this.filters[0].options = Array.from(new Set(data.map(d=>{return d.status})))
    this.filters[1].options = Array.from(new Set(data.map(d=>{return d.tipo})))
    this.filters[2].options = Array.from(new Set(data.map(d=>{return d.proveedor})))
    this.filters[3].options = Array.from(new Set(data.flatMap(d => d.piezas).map(p => p.title)))
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
  
  }

  async getImages(){

    const params = new HttpParams()
    .set('projectId', this.api.currentProject._id!)
    .set('ordenId', this.currentOrden._id);
    const r = await firstValueFrom<ICEMR<any>>(this.http.get<ICEMR<any>>("http://localhost:3000/order/images",{params:params}))
    this.images = r.data
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

  

  async createOrder(tipo:string,folio:string,list:Array<Pieza>,date:Date,proveedor:User){
    const r = await this.api.uploadPiezasConImagenes(list, date,proveedor._id!,tipo,folio)
    let desc = tipo == "Maquinado"?MILESTONE_DESC.ORDER_MAQUI_CREATED:MILESTONE_DESC.ORDER_DETAIL_CREATED as string
    desc = desc+" Folio #"+folio
    const what = createWhat(list,"piezas")
    await this.api.updateLog(createMilestone(desc,r.insert.insertedId,this.api.currentUser._id!,what,proveedor._id))
  }

  

  async aprobar(result:{razon:string,bool:boolean,piezas:Pieza[]},idCatalogo:string){
    this.currentOrden.piezas = this.piezasEnPanel
    let recibidas = 0
    let what:What[] = []
    let piezasToWhat:Pieza[] = []
    this.currentOrden.piezas.forEach(p=>{
      const pieza = result.piezas.find(pi=>{return p.title == pi.title}) 
      if(pieza != undefined){
        piezasToWhat.push(pieza)
        recibidas += pieza.cantidadInDialog!
        p.razonRechazo = result.razon
        p.cantidadRecibida.push(pieza.cantidadInDialog!)
      }
    })
    what = createWhat(piezasToWhat,"cantidadInDialog")

    await this.api.updateOrder(this.currentOrden,"RECIBIDA")
    const cual = this.currentOrden.tipo == "Detalle" ? "cantidadDetalle":"cantidadManufactura"
    await this.api.updateCatalogo(cual,this.currentOrden.piezas,idCatalogo)
    const desc =  `(${recibidas}) Piezas recibidas para orden de ${this.currentOrden.tipo} #${this.currentOrden.folio}`
    await this.api.updateLog(createMilestone(desc,this.currentOrden._id,this.api.currentUser._id!,what,this.currentOrden.idProveedor))
    const r = await this.api.getOrder(this.currentOrden._id)
    this.currentOrden = r.data
    this.piezasEnPanel = JSON.parse(JSON.stringify(this.currentOrden.piezas))
    
  }

  async rechazar(result:{razon:string,bool:boolean,piezas:Pieza[]},idCatalogo:string){
    this.currentOrden.piezas = this.piezasEnPanel
    let recibidas = 0
    let what:What[] = []
    let piezasToWhat:Pieza[] = []
    this.currentOrden.piezas.forEach(p=>{
      const pieza = result.piezas.find(pi=>{return p.title == pi.title}) 
      
      if(pieza != undefined){
        piezasToWhat.push(pieza)
        recibidas += pieza.cantidadInDialog!
        p.razonRechazo = result.razon
        p.cantidadRechazada?.push(pieza.cantidadInDialog!)
      }
    })
    what = createWhat(piezasToWhat,"cantidadInDialog")
    await this.api.updateOrder(this.currentOrden,"RECHAZADA")
    const desc =  `(${recibidas}) Piezas rechazadas para orden de ${this.currentOrden.tipo} #${this.currentOrden.folio} Razón: ${result.razon}`
    await this.api.updateCatalogo("cantidadRechazada",this.currentOrden.piezas,idCatalogo)
    await this.api.updateLog(createMilestone(desc,this.currentOrden._id,this.api.currentUser._id!,what,this.currentOrden.idProveedor))
    const r = await this.api.getOrder(this.currentOrden._id)
    this.currentOrden = r.data
    this.piezasEnPanel = JSON.parse(JSON.stringify(this.currentOrden.piezas))
  }

  async actualizarStatus(status:StatusOrden){
    await this.api.updateOrderStatus(this.currentOrden._id,status)
    const desc = this.currentOrden.tipo == "Detalle" ? "ORDEN DETALLE "+status : "ORDEN MAQUINADO "+status
     await this.api.updateLog({description:desc,generalId:this.currentOrden._id,createdBy:this.api.currentUser._id,expand:true})
    this.currentOrden.status = status
  }

  
}
