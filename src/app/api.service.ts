import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from './users-module/User';
import { ICEMDR, ICEMR } from '@shared-types/ICEMR';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo';
import { Bitacora, Milestone } from '@shared-types/Bitacora';
import { Proyecto } from '@shared-types/Proyecto';
import { Usuario } from '@shared-types/Usuario';
import { Catalogo, Pieza } from '@shared-types/Pieza';
export type AllR ={
  proyectos:Proyecto[]
  ordenes:OrdenTrabajo[]
  catalogo:Catalogo
  bitacora:Bitacora
}
@Injectable({
  providedIn: 'root'
})
export class APIService {
  BASE = "http://localhost:3000"
  
  currentProject!:Proyecto
  currentUser!:Usuario
  projects:Proyecto[] = []
  users:Usuario[] = []
  proveedores:User[] = []
  private headers = new HttpHeaders().append("Content-Type", 'application/json')
  http = inject(HttpClient);  
  constructor() { }

  async getAll(){
    const body = {
      projectId:this.currentProject._id!,
      catalogId:this.currentProject.catalogId!
    }
    const r = await firstValueFrom<ICEMR<AllR>>(this.http.get<ICEMR<AllR>>("http://localhost:3000/projectData",{params:body}))
    this.projects = r.data.proyectos
    return r;
  }

  async readProject(dir:string){
    const params = new HttpParams().append('dir', dir);
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/pdf",{params:params}))
    return r
  }
  async downloadPDF(order:any){
    const r = await firstValueFrom<any>(this.http.post("http://localhost:3000/pdf",order))
    return r
  }
  async getCatalog(catalogId:string){
    const params = new HttpParams().append('catalogId', catalogId);
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/catalog",{params:params}))
    return r
  }

  

  async getFolio(){
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/order/folio"))
    return r
  }

  async getOrders(){
    const r = await this.GET<ICEMDR<OrdenTrabajo>>("order/all",{attr:"projectId",value:this.currentProject._id!})
    r.data.forEach(o=>{
      o.proveedor = this.proveedores.find(p=>{return p._id == o.idProveedor})!.name
    })
    return r
  }
  async getOrder(orderId:string){
    const params = new HttpParams().append('orderId', orderId);
    const r = await this.GET<ICEMR<OrdenTrabajo>>("order",{attr:"orderId",value:orderId})
    r.data.proveedor = this.proveedores.find(p=>{return p._id == r.data.idProveedor})!.name
    return r
  }

  async createCatalog(form:FormData,projectId:string){
    form.append("projectId",projectId)
    try{
      const r = await firstValueFrom<any>(this.http.post("http://localhost:3000/catalog",form))
      this.currentProject.catalogId = r.log.insertedId
      return {response:r}
    }catch(e){
      return {e,response:undefined}
    }
  }

  async updateOrder(orden:OrdenTrabajo,action:"RECIBIDA"|"RECHAZADA"){
    const body = {
      status:action,
      orden:orden
    }
    await this.PUT<ICEMR<OrdenTrabajo>>("order",body)
  }
  async updateOrderStatus(orden:string,status:string){
    const body = {
      status:status,
      id:orden
    }
    await this.PUT<ICEMR<OrdenTrabajo>>("order/status",body)
  }
  async updateLog(milestone:Milestone){
    const body = {
      milestone:milestone,
      projectId:this.currentProject._id
    }
    const r = await firstValueFrom<any>(this.http.put("http://localhost:3000/logs",body))
  }

  async updateCatalogo(attr:string, piezas:Pieza[],catalogId:string){
    const body = {
      piezas:piezas,
      attr:attr,
      catalogId:catalogId
    }
    const r = await firstValueFrom<any>(this.http.put("http://localhost:3000/catalog",body))
    return r
  }

  async updateProjectStatus(status:string){
    await this.PUT("projects/status",{status:status,projectId:this.currentProject._id})
  }
  async updateProject(count:number){
    const ids = {
      catalogId:this.currentProject.catalogId,
      userId:this.currentUser._id,
      projectId:this.currentProject._id!,
      count:count
    }
    const r = await firstValueFrom<any>(this.http.put("http://localhost:3000/projects",ids,{headers:this.headers}))
    return r
  }

  async createProject(project:Proyecto){
    const body = {
      proyecto:project,
      creador:this.currentUser
    }
    const r = await firstValueFrom<any>(this.http.post("http://localhost:3000/projects",body,{headers:this.headers}))
    return project
  }
  async createUser(usuario:string,code:string,rol:string){
    await firstValueFrom<any>(this.http.post("http://localhost:3000/user",{name:usuario,code:code,rol:rol},{headers:this.headers}))
  }
  async createProveedor(proveedor:string){
    await firstValueFrom<any>(this.http.post("http://localhost:3000/proveedor",{name:proveedor},{headers:this.headers}))
  }

  async getUsers(){
    this.users = []
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/user",{headers:this.headers}))
    r.data.forEach((u:User)=>{this.users.push({name:u.name,rol:u.rol!,color:u.color!,_id:u._id,short:u.short!})})
    return this.users
  }
  async getProveedores(){
    this.proveedores = []
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/proveedor",{headers:this.headers}))
    r.data.forEach((u:User)=>{this.proveedores.push(new User(u.name,u.rol!,u.color!,u._id))})
    return this.proveedores
  }

  async getProjects(status:string){
    this.projects = []
    const r = await this.GET<ICEMDR<Proyecto>>("projects/all",{attr:"status",value:status})
    this.projects = r.data
    // r.data.forEach((p:Project)=>{
    //   // const project = new Project(p)
    //   // project.setUser(this.findUserbyId(p.idUser!))
    //   this.projects.push(project)
    // })
    return this.projects
  }

  async uploadPiezasConImagenes(piezas: any[],date:Date,p:string,tipo:string,folio:string) {
    const body = {
      idProject:this.currentProject._id!,
      idProveedor:p,
      dateEntrega:date.toISOString(),
      tipo:tipo,
      folio:folio,
      piezas:piezas
    }
    // const formData = new FormData();
    // formData.append("idProject",this.currentProject._id!)
    // formData.append("idProveedor",p)
    // formData.append("dateEntrega",date.toISOString())
    // formData.append("tipo",tipo)
    // formData.append("folio",folio)
    // formData.append("piezas",piezas)
    // piezas.forEach((pieza, i) => {
      
    //   formData.append(`piezas[${i}]`, JSON.stringify({ ...pieza, imagenes: undefined }));
    //   if (pieza.imagenes) {
    //     pieza.imagenes.forEach((img: File, j: number) => {
    //       formData.append(`imagenes[${i}][]`, img, pieza.title+"_"+j);
    //     });
    //   }
    // });
    const r = await firstValueFrom(this.http.post("http://localhost:3000/order", body));
    return r as any
  }

  private findUserbyId(id:string){
    return this.users.find(u=>{return u._id = id})!
  }

  async POST<T>(route:string,body:Object){
    return await firstValueFrom<T>(this.http.post<T>(`${this.BASE}/${route}`, body));
  }
  private async PUT<T>(route:string,body:Object){
    await firstValueFrom<T>(this.http.put<T>(`${this.BASE}/${route}`, body));
  }

  async GET<T>(route:string,param:{attr:string,value:string}){
    const params = new HttpParams().append(param.attr, param.value);
    console.log(`${this.BASE}/${route}`)
    const r = await firstValueFrom<T>(this.http.get<T>(`${this.BASE}/${route}`,{params:params}))
    return r
  }
}
