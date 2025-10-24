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
import { Salida } from '@shared-types/Salida';
import { StorageService } from './storage.service';
import { FormGroup } from '@angular/forms';
import { Proveedor } from '@shared-types/Proveedor';
import { Rechazo } from '@shared-types/Rechazo';
export type AllR ={
  proyectos:Proyecto[]
  ordenes:OrdenTrabajo[]
  catalogo:Catalogo
  bitacora:Bitacora
  salidas:Salida[],
  rechazos:Rechazo[],
  userData:{
    p: Usuario[];
    r: any[];
}
  proveedores:Proveedor[]
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
  rechazos:Rechazo[] = []
  filteredUsuarios:Usuario[] = []
  roles:any[] = []
  proveedores:Proveedor[] = []
  private headers = new HttpHeaders().append("Content-Type", 'application/json')
  http = inject(HttpClient); 
  constructor(private storage:StorageService) { }

  async getAll(){
    const body = {
      projectId:this.currentProject._id!,
      catalogId:this.currentProject.catalogId!
    }
    const r = await firstValueFrom<ICEMR<AllR>>(this.http.get<ICEMR<AllR>>("http://localhost:3000/projectData",{params:body}))
    this.projects = r.data.proyectos
    this.users = []
    this.filteredUsuarios = []
    this.roles = []
    this.roles = r.data.userData.r
    this.rechazos = r.data.rechazos
    this.proveedores = r.data.proveedores
    
    r.data.userData.p.forEach((u:User)=>{this.users.push({name:u.name,rol:u.rol!,color:u.color!,_id:u._id,short:u.short!,actions:this.roles.find(r=>{return r.rol == u.rol}).permisos})})
    this.filteredUsuarios = structuredClone(this.users.filter(u=>{return u.active!}))
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

  async uploadImagenes(formData: FormData) {
    await firstValueFrom(this.http.post("http://localhost:3000/order/images",formData));
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

  async addPieza(form:FormData,catalogId:string){
    form.append("catalogId",catalogId)
    form.append("projectId",this.currentProject._id!)
    const r = await firstValueFrom<any>(this.http.post("http://localhost:3000/catalog/plano",form))
    return r
  }

  async updateStock(body:any){
     const r = await firstValueFrom<any>(this.http.put("http://localhost:3000/catalog/stock",body))
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
  async createUser(form:FormGroup){
    let body = {
      name:form.get("username")?.value,
      code:form.get("code")?.value,
      rol:form.get("rol")?.value,
      active:form.get('active')?.value,
      
    } 
    await firstValueFrom<any>(this.http.post("http://localhost:3000/user",body))
  }
  async createRechazo(form:FormGroup){
    let body = {
      name:form.get("name")?.value,
      active:form.get('active')?.value,
    } 
    await firstValueFrom<any>(this.http.post("http://localhost:3000/rechazo",body))
  }
  async editUser(usuario:Usuario){
    await firstValueFrom<any>(this.http.put("http://localhost:3000/user",usuario))
  }
  async editRechazo(rechazo:Rechazo){
    await firstValueFrom<any>(this.http.put("http://localhost:3000/rechazo",rechazo))
  }
  
  async createProveedor(form:FormGroup){
    const body = {
      name:form.get("proveedor")?.value,
      tipo:form.get("tipo")?.value,
      createdBy:this.currentUser._id
    }
    await firstValueFrom<any>(this.http.post("http://localhost:3000/proveedor",body,{headers:this.headers}))
  }

  async getUsers(returnAdmin = true){
    this.users = []
    this.roles = []
    this.filteredUsuarios = []
    const r = await this.GET<any>("user",{attr:"a",value:returnAdmin+""})
    this.roles = r.data.r
    r.data.p.forEach((u:any)=>{this.users.push({
      name:u.name,
      rol:u.rol!,
      color:u.color!,
      _id:u._id,
      short:u.short!,
      code:u.code,
      active:u.active,
      isActive:u.active == true? "Activo":"No Activo",
      actions:this.roles.find(r=>{return r.rol == u.rol}).permisos})})
    this.filteredUsuarios = structuredClone(this.users.filter(u=>{return u.active!}))
    return this.users
  }
  async getRechazos(){
    this.rechazos = []
    const r = await this.GET<ICEMDR<Rechazo>>("rechazo")
    r.data.forEach(re=>{
      re.isActive = re.active? "Activo":"No Activo"
    })
    this.rechazos = r.data
    return this.rechazos
  }
  async getProveedores(){
    this.proveedores = []
    const r = await this.GET<ICEMDR<Proveedor>>("proveedor")
    this.proveedores = r.data
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
      project:this.currentProject.name,
      catalogId:this.currentProject.catalogId,
      idProveedor:p,
      dateEntrega:date.toISOString(),
      tipo:tipo,
      folio:folio,
      piezas:piezas,
      user:this.currentUser
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

  async PUT<T>(route:string,body:Object){
    await firstValueFrom<T>(this.http.put<T>(`${this.BASE}/${route}`, body));
  }

  async GET<T>(route:string,param?:{attr:string,value:string}){
    const params =  param? new HttpParams().append(param.attr, param.value):{}
    const r = await firstValueFrom<T>(this.http.get<T>(`${this.BASE}/${route}`,{params:params}))
    return r
  }
  async GET2<T>(route:string,params?:HttpParams){
    const r = await firstValueFrom<T>(this.http.get<T>(`${this.BASE}/${route}`,{params:params}))
    return r
  }
}
