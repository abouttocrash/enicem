import { Injectable } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { APIService } from './api.service';
import {  ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { Catalogo, CatalogoResponse, Pieza } from '@shared-types/Pieza';
import { HttpParams } from '@angular/common/http';
import { createWhat, sum } from './utils/Utils';
import { Milestone } from '@shared-types/Bitacora';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private route = "catalog"
  private sort!:MatSort
  
  dataSource!: MatTableDataSource<Pieza>;
  constructor(private api:APIService) { }

  init(data:Catalogo,sort?:MatSort){
    data.logs.forEach(item=>{
      item.stockNumber = 0
      item.stock.forEach(s=>{
       item.stockNumber! += s.c
      })
    })
    this.dataSource = new MatTableDataSource(data.logs);
    if(sort)
      this.sort = sort;
    this.dataSource.sort = this.sort;
    
  }

  async createCatalog(milestone:Milestone){
    try{
      let body = {
        projectId:this.api.currentProject._id,
        userId:this.api.currentUser._id,
        milestone:milestone
      }
      const r = await this.api.POST<ICEMR<CatalogoResponse>>("catalog",body)
      if(r)
        this.api.currentProject.catalogId = r.data.catalogId
      return {response:r!.data}
    }catch(e){
      return {e,response:undefined}
    }
  }
  async updateCatalog(milestone:Milestone){
    try{
      let body = {
        projectId:this.api.currentProject._id,
        userId:this.api.currentUser._id!,
        catalogId:this.api.currentProject.catalogId!,
        milestone:milestone
      }
      //TODO error correcto
      const r = await this.api.POST<ICEMR<CatalogoResponse>>("catalog/add",body)
      if(r)
      return {response:r.data}
      else
          return this.api.FAILURE
    }catch(e){
      return this.api.FAILURE
    }
  }

  async addPieza(form:FormData){
    form.append("catalogId",this.api.currentProject.catalogId!)
    form.append("projectId",this.api.currentProject._id!)
    const r =  await this.api.POST<ICEMDR<Pieza>>("catalog/plano",form)
    return r
  }

  async verificarPlanos(form:FormData){
    try{
      
      const r = await this.api.POST<ICEMDR<Pieza>>("catalog/verify",form)
      if(r)
      return r.data
      else
          return {response:undefined}
    }catch(e){
      return {e,response:undefined}
    }
  }

  async removePieza(plano:string){
    let httpParams = new HttpParams()
    .set("catalogId",this.api.currentProject.catalogId!)
    .set("projectId",this.api.currentProject._id!)
    .set("plano",plano)
    try{
    const r = await this.api.DELETE<ICEMDR<Pieza>>("catalog/plano",httpParams)
    return true
    }catch(e){
      console.log(e)
      return false
    }
  }
  async removePlano(plano:string){
    let httpParams = new HttpParams()
    .set("filename",plano)
    .set("projectId",this.api.currentProject._id!)
    try{
    const r = await this.api.DELETE<ICEMDR<Pieza>>("catalog/clear/one",httpParams)
    return true
    }catch(e){
      console.log(e)
      return false
    }
  }

  async createScrap(piezas:Pieza[]){
      const body = {
        piezas:piezas,
        tipo:"Scrap",
        project:this.api.currentProject.name,
        idProject:this.api.currentProject._id!,
        user:this.api.currentUser,
        catalogId:this.api.currentProject.catalogId
      }
      let total = 0
    const what = createWhat(piezas,"cantidadInDialog")
    what.forEach(w=>{
      total += w.cantidad
    })
    const bodyStock = {
        piezas:what,
        catalogId:this.api.currentProject.catalogId!,
        razon:"SALIDA Scrap"
      }
     
    await this.api.updateStock(bodyStock)
    const r = await this.api.POST<ICEMR<any>>(this.route+"/almacen",body) as any
    const desc = `(${total}) Piezas a scrap - ${piezas[0].razonRechazo}`
    await this.api.updateLog({description:desc ,generalId:r.inserted.insertedId,createdBy:this.api.currentUser._id,expand:true,what})
  }
  async createAlmacen(piezas:Pieza[]){
    const body = {
      piezas:piezas,
      tipo:"Integración",
      idProject:this.api.currentProject._id!,
      project:this.api.currentProject.name,
      user:this.api.currentUser,
      catalogId:this.api.currentProject.catalogId
    }
    let total = 0
    const what = createWhat(piezas,"cantidadInDialog")
    what.forEach(w=>{
      total += w.cantidad
    })
    const r = await this.api.POST<ICEMR<any>>(this.route+"/almacen",body) as any
    const desc = `(${total}) Piezas solicitadas a almacen #${r.inserted.prevFolio}`
    await this.api.updateLog({description:desc ,generalId:r.inserted.insertedId,createdBy:this.api.currentUser._id,expand:true,what})
    
  }
  async reporteCatalogo(){
    const params = new HttpParams()
    .set("catalogId",this.api.currentProject.catalogId!)
    .set("project",this.api.currentProject.name)
    .set("projectId",this.api.currentProject._id!)
    .set("clave",this.api.currentProject.noSerie)
    const r = await this.api.GET2<ICEMR<any>>(`${this.route}/reporte`,params)
    return r
  }
  
  async getCatalog(){
    const params = new HttpParams()
    params.set("catalogId",this.api.currentProject.catalogId!)
    params.set("projectId",this.api.currentProject._id!)
    const r = await this.api.GET2<ICEMR<any>>(this.route,params)
    return r
  }
}
