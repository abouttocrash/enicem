import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Project } from './projects-module/Proyecto';
import { User } from './users-module/User';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  currentProject!:Project
  currentUser!:User
  projects:Project[] = []
  users:User[] = []
  private headers = new HttpHeaders().append("Content-Type", 'application/json')
  private http = inject(HttpClient);  
  constructor() { }

  async readProject(dir:string){
    const params = new HttpParams().append('dir', dir);
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/pdf",{params:params}))
    return r
  }
  async getLog(logId:string){
    const params = new HttpParams().append('logId', logId);
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/log",{params:params}))
    return r
  }

  async getOrders(projectId:string){
    const params = new HttpParams().append('projectId', projectId);
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/orders",{params:params}))
    return r
  }
  async getOrder(orderId:string){
    const params = new HttpParams().append('orderId', orderId);
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/order",{params:params}))
    return r
  }

  async createLog(form:FormData){
    const r = await firstValueFrom<any>(this.http.post("http://localhost:3000/log",form))
    return r
  }

  async updateProject(logId:string,userId:string,projectId:string,count:number){
    const ids = {
      logId:logId,
      userId:userId,
      projectId:projectId,
      count:count
    }
    const r = await firstValueFrom<any>(this.http.put("http://localhost:3000/updateProject",ids,{headers:this.headers}))
    return r
  }

  async createProject(project:Project){
    const r = await firstValueFrom<any>(this.http.post("http://localhost:3000/createProject",project.toApi(),{headers:this.headers}))
    project.setId(r.data.insertedId)
    project.createdAt = r.data.createdAt
    this.projects.push(project)
    return project
  }
  async createUser(usuario:string){
    await firstValueFrom<any>(this.http.post("http://localhost:3000/createUser",{name:usuario},{headers:this.headers}))
  }

  async getUsers(){
    this.users = []
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/users",{headers:this.headers}))
    r.data.forEach((u:User)=>{this.users.push(new User(u.name,u.rol!,u.color!,u._id))})
    return this.users
  }

  async getProjects(){
    this.projects = []
    const r = await firstValueFrom<any>(this.http.get("http://localhost:3000/projects",{headers:this.headers}))
    r.data.forEach((p:Project)=>{
      const project = new Project(p.name,p.noSerie,p.status)
      project.setId(p._id!)
      project.logId = p.logId
      project.createdBy = p.createdBy
      project.createdAt = p.createdAt
      project.count = p.count
      project.setUser(this.findUserbyId(p.idUser!))
      this.projects.push(project)
    })
  }

  async uploadPiezasConImagenes(piezas: any[],idProject:string) {
    const formData = new FormData();
    formData.append("idProject",idProject)
    piezas.forEach((pieza, i) => {
      
      formData.append(`piezas[${i}]`, JSON.stringify({ ...pieza, imagenes: undefined }));
      if (pieza.imagenes) {
        pieza.imagenes.forEach((img: File, j: number) => {
          formData.append(`imagenes[${i}][]`, img, pieza.title+"_"+j);
        });
      }
    });
    await firstValueFrom(this.http.post("http://localhost:3000/ordenTrabajo", formData));
  }

  private findUserbyId(id:string){
    return this.users.find(u=>{return u._id = id})!
  }
}
