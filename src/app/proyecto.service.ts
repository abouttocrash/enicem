import { inject, Injectable } from '@angular/core';
import { APIService, ErrorType, PostType } from './api.service';
import { OrdenesService } from './ordenes/ordenes.service';
import { BitacoraService } from './bitacora.service';
import { CatalogoService } from './catalogo.service';
import { SalidaService } from './salida.service';
import { FormGroup } from '@angular/forms';
import { Proyecto } from '@shared-types/Proyecto';
import { ICEMDR } from '@shared-types/ICEMR';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  o = inject(OrdenesService)
  b = inject(BitacoraService)
  c = inject(CatalogoService)
  s = inject(SalidaService)
  
  private userRoute = "user"
  constructor(public api:APIService ) {}

  async createProject(project:Proyecto){
    try{
      const body = {
        proyecto:project,
        creador:this.api.currentUser
      }
      const r = await this.api.POST<PostType>('projects',body)
      return project
    }
    catch(e:any){
      const error = e.error as ErrorType
      return error
    }
  }

  async getAll(){
    const r = await this.api.getAll()
    this.o.init(r.data.ordenes)
    this.b.init(r.data.bitacora)
    this.c.init(r.data.catalogo)
    this.s.init(r.data.salidas)
  }

  async getProjects(status:string){
    try{
      this.api.projects = []
      const r = await this.api.GET<ICEMDR<Proyecto>>("projects/all",{attr:"status",value:status})
      this.api.projects = r.data
      return {success:true,p:this.api.projects}
    }catch(e:any){
      const error = e.error as ErrorType
      return {error:error,p:[]}
    }
    
  }

  async editProyecto(pData:any){
    const body = {
      pData:pData,
      projectId : this.api.currentProject._id
    }
    try{
      await this.api.PUT("projects/edit",body)
      return true
    }catch(e:any){
      const error = e.error as ErrorType
      return error
    }
  }
  async cancelProyecto(pData:any){
    const body = {
      pData:pData,
      projectId : this.api.currentProject._id
    }
    try{
      await this.api.PUT("projects/cancel",body)
      return true
    }catch(e){
      return false
    }
  }
  async createUser(form:FormGroup){
    let body = {
      name:form.get("username")?.value,
      code:form.get("code")?.value,
      rol:form.get("rol")?.value,
      active:form.get('active')?.value,
      
    } 
    await this.api.POST(this.userRoute,body)
  }
}
