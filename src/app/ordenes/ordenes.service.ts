import { inject, Injectable } from '@angular/core';
import { APIService } from '../api.service';
import { ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { OrdenTrabajo, StatusOrden } from '@shared-types/OrdenTrabajo';
import { Pieza } from '@shared-types/Pieza';
import { createMilestone, MILESTONE_DESC, What } from '@shared-types/Bitacora';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createWhat } from '../utils/Utils';
import { MatDrawer } from '@angular/material/sidenav';
import { AutoFilter } from '../components/auto-icem/auto-icem.component';
import { Proveedor } from '@shared-types/Proveedor';

// Add a minimal declaration for the Web Serial API to satisfy TypeScript
declare global {
  interface Navigator {
    serial?: any;
    hid?:any
  }
}

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
  currentOrden!:OrdenTrabajo | undefined
  piezasEnPanel:Array<Pieza> = []
  displayedColumns: string[] = ['folio','tipo','totalPiezas','proveedor','creada', 'dateEntrega','status','dateReal','cantidadRecibida','cantidadRechazada','cantidadPendiente'];
  dataSource!: MatTableDataSource<OrdenTrabajo>;
  private route = "order"
  constructor(private api:APIService) {}

  init(data:OrdenTrabajo[],drawer?:MatDrawer,sort?:MatSort){
    data.forEach(d=>{
      d.cantidadRecibida = 0 
      d.cantidadRechazada = 0
      d.piezas.forEach(p=>{
        p.cantidadRecibida.forEach(pr=>{
          d.cantidadRecibida += pr
        })
        p.cantidadRechazada.forEach(pr=>{
          d.cantidadRechazada += pr
        })
         
      })
    })
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
    .set('projectId', this.currentOrden?.idProject!)
    .set('ordenId', this.currentOrden!._id);
    const r = await this.api.GET2<any>(`${this.route}/images`,params)
    this.images = r.data
  }

  async uploadImagenes(formData: FormData) {
    await firstValueFrom(this.http.post(`${this.api.BASE}/${this.route}/images`,formData));
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
    if(this.api.proveedores.length == 0){
      await this.api.getProveedores()
    }
    const r = await this.api.GET<ICEMR<OrdenTrabajo>>("order/",{attr:"orderId",value:_id!})
    r.data.proveedor = this.api.proveedores.find(p=>{return p._id == r.data.idProveedor})!.name
    
    return r.data
  }

  async uploadOrden(piezas: any[],date:Date,p:string,tipo:string,folio:string) {
    const body = {
      idProject:this.api.currentProject._id!,
      project:this.api.currentProject.name,
      catalogId:this.api.currentProject.catalogId,
      idProveedor:p,
      dateEntrega:date.toISOString(),
      tipo:tipo,
      folio:folio,
      piezas:piezas,
      user:this.api.currentUser
    }
    
    const r = await firstValueFrom(this.http.post(`${this.api.BASE}/${this.route}`, body));
    return r as any
  }
  async verifyOrder(list:Array<Pieza>){
    const body = {
      list:list,
      id:this.api.currentProject.catalogId
    }
    const r = await this.api.POST(`${this.route}/verify`,body) as unknown as any
    return r.data.todoBien

  }
  async createOrder(tipo:string,folio:string,list:Array<Pieza>,date:Date,proveedor:Proveedor){
    let desc = tipo == "Maquinado"?MILESTONE_DESC.ORDER_MAQUI_CREATED:MILESTONE_DESC.ORDER_DETAIL_CREATED as string
    desc = desc+" Folio #"+folio
    list.forEach(p=>{
      p.piezas = p.cantidadInDialog!.toString()
    })
    const todoBien = await this.verifyOrder(list)
    if(todoBien){
      const r = await this.uploadOrden(list, date,proveedor._id!,tipo,folio)
    const what = createWhat(list,"piezas")
    if(tipo == "Detalle"){
      const body = {
        piezas:what,
        catalogId:this.api.currentProject.catalogId!,
        razon:"SALIDA Detalle"
      }
     
      await this.api.updateStock(body)
    }
    await this.api.updateLog(createMilestone(desc,r.insert.insertedId,this.api.currentUser._id!,what,proveedor._id))
    }
    return todoBien
    
  }


  async updateOrder(orden:OrdenTrabajo,action:"RECIBIDA"|"RECHAZADA"){
    const body = {
      status:action,
      orden:orden
    }
    await this.api.PUT<ICEMR<OrdenTrabajo>>(this.route,body)
  }
  

  async aprobar(result:{razon:string,bool:boolean,piezas:Pieza[]},idCatalogo:string){
    this.currentOrden!!.piezas = this.piezasEnPanel
    let recibidas = 0
    let what:What[] = []
    let piezasToWhat:Pieza[] = []
    this.currentOrden!!.piezas.forEach(p=>{
      const pieza = result.piezas.find(pi=>{return p.title == pi.title}) 
      if(pieza != undefined){
        piezasToWhat.push(pieza)
        recibidas += pieza.cantidadInDialog!
        p.razonRechazo = result.razon
        p.cantidadRecibida.push(pieza.cantidadInDialog!)
        p.fechaRecibida.push({c:pieza.cantidadInDialog!,fecha:new Date().toISOString()})
        
      }
    })
    what = createWhat(piezasToWhat,"cantidadInDialog")

    await this.updateOrder(this.currentOrden!,"RECIBIDA")
    const cual = this.currentOrden!.tipo == "Detalle" ? "cantidadDetalle":"cantidadManufactura"
    await this.api.updateCatalogo(cual,this.currentOrden!.piezas,idCatalogo)
    
       const body = {
        piezas:what,
        catalogId:this.api.currentProject.catalogId!,
        razon:`ENTRADA ${this.currentOrden!!.tipo}`
      }
      await this.api.updateStock(body)
    
    const desc =  `(${recibidas}) Piezas recibidas para orden de ${this.currentOrden!.tipo} #${this.currentOrden!.folio}`
    await this.api.updateLog(createMilestone(desc,this.currentOrden!._id,this.api.currentUser._id!,what,this.currentOrden!.idProveedor))
    const r = await this.getOrder(this.currentOrden!._id)
    this.currentOrden! = r
    this.piezasEnPanel = JSON.parse(JSON.stringify(this.currentOrden!.piezas))
    
  }

  

  async rechazar(result:{razon:string,bool:boolean,piezas:Pieza[]},idCatalogo:string){
    this.currentOrden!.piezas = this.piezasEnPanel
    let recibidas = 0
    let what:What[] = []
    let piezasToWhat:Pieza[] = []
    this.currentOrden!.piezas.forEach(p=>{
      const pieza = result.piezas.find(pi=>{return p.title == pi.title}) 
      
      if(pieza != undefined){
        piezasToWhat.push(pieza)
        recibidas += pieza.cantidadInDialog!
        p.razonRechazo = result.razon
        p.cantidadRechazada?.push(pieza.cantidadInDialog!)
      }
    })
    what = createWhat(piezasToWhat,"cantidadInDialog")
    await this.updateOrder(this.currentOrden!,"RECHAZADA")
    const desc =  `(${recibidas}) Piezas rechazadas para orden de ${this.currentOrden!.tipo} #${this.currentOrden!.folio} Razón: ${result.razon}`
    await this.api.updateCatalogo("cantidadRechazada",this.currentOrden!.piezas,idCatalogo)
    await this.api.updateLog(createMilestone(desc,this.currentOrden!._id,this.api.currentUser._id!,what,this.currentOrden!.idProveedor))
    const r = await this.getOrder(this.currentOrden!._id)
    this.currentOrden! = r
    this.piezasEnPanel = JSON.parse(JSON.stringify(this.currentOrden!.piezas))
  }

  async actualizarStatus(status:StatusOrden){
    await this.api.PUT<ICEMR<OrdenTrabajo>>("order/status",{status:status,id:this.currentOrden!._id})
    const desc = this.currentOrden!.tipo == "Detalle" ? "ORDEN DETALLE "+status : "ORDEN MAQUINADO "+status
    await this.api.updateLog({description:desc,generalId:this.currentOrden!._id,createdBy:this.api.currentUser._id,expand:true})
    this.currentOrden!.status = status
  }

  async getAllOrders(params:any){
     return await this.api.GET2<ICEMDR<OrdenTrabajo>>(`${this.route}/ordersview`,params)
  }

 

  
}
