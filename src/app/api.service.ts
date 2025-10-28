import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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
  
  BASE = "http://localhost:3000/api"
  
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
    const r = await firstValueFrom<ICEMR<AllR>>(this.http.get<ICEMR<AllR>>(`${this.BASE}/projectData`,{params:body}))
    this.projects = r.data.proyectos
    this.users = []
    this.filteredUsuarios = []
    this.roles = []
    this.roles = r.data.userData.r
    this.rechazos = r.data.rechazos
    this.proveedores = r.data.proveedores
    
    r.data.userData.p.forEach((u:Usuario)=>{this.users.push({name:u.name,rol:u.rol!,color:u.color!,_id:u._id,short:u.short!,actions:this.roles.find(r=>{return r.rol == u.rol}).permisos})})
    this.filteredUsuarios = structuredClone(this.users.filter(u=>{return u.active!}))
    return r;
  }

  async getFolio(){
    const r = await firstValueFrom<any>(this.http.get(`${this.BASE}/order/folio`))
    return r
  }

  async getOrders(){
    const r = await this.GET<ICEMDR<OrdenTrabajo>>("order/all",{attr:"projectId",value:this.currentProject._id!})
    r.data.forEach(o=>{
      o.proveedor = this.proveedores.find(p=>{return p._id == o.idProveedor})!.name
    })
    return r
  }
 

  

  async updateStock(body:any){
     const r = await firstValueFrom<any>(this.http.put(`${this.BASE}/catalog/stock`,body))
  }
  
  async updateLog(milestone:Milestone){
    const body = {
      milestone:milestone,
      projectId:this.currentProject._id
    }
    const r = await firstValueFrom<any>(this.http.put(`${this.BASE}/logs`,body))
  }
  //TODO mover al back
  async updateCatalogo(attr:string, piezas:Pieza[],catalogId:string){
    const body = {
      piezas:piezas,
      attr:attr,
      catalogId:catalogId
    }
    const r = await firstValueFrom<any>(this.http.put(`${this.BASE}/catalog`,body))
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
    const r = await firstValueFrom<any>(this.http.put(`${this.BASE}/projects`,ids,{headers:this.headers}))
    return r
  }

  async createProject(project:Proyecto){
    const body = {
      proyecto:project,
      creador:this.currentUser
    }
    const r = await firstValueFrom<any>(this.http.post(`${this.BASE}/projects`,body,{headers:this.headers}))
    return project
  }
  
  async createRechazo(form:FormGroup){
    let body = {
      name:form.get("name")?.value,
      active:form.get('active')?.value,
    } 
    await firstValueFrom<any>(this.http.post(`${this.BASE}/rechazo`,body))
  }
  async editUser(usuario:Usuario){
    await firstValueFrom<any>(this.http.put(`${this.BASE}/user`,usuario))
  }
  async editRechazo(rechazo:Rechazo){
    await firstValueFrom<any>(this.http.put(`${this.BASE}/rechazo`,rechazo))
  }
  
  async createProveedor(form:FormGroup){
    const body = {
      name:form.get("proveedor")?.value,
      tipo:form.get("tipo")?.value,
      createdBy:this.currentUser._id
    }
    await firstValueFrom<any>(this.http.post(`${this.BASE}/proveedor`,body,{headers:this.headers}))
  }
  async editProveedor(form:FormGroup,id:string){
    const body = {
      _id:id,
      name:form.get("proveedor")?.value,
      tipo:form.get("tipo")?.value,
      active:form.get("active")?.value
    }
    await firstValueFrom<any>(this.http.put(`${this.BASE}/proveedor`,body,{headers:this.headers}))
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
    this.proveedores.forEach(p=>{
      p.isActive = p.active? "Activo":"No Activo"
    })
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
