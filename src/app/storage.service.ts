import { Injectable } from '@angular/core';
import { Proyecto } from '@shared-types/Proyecto';
import { Usuario } from '@shared-types/Usuario';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  setProject(project:Proyecto){
    localStorage.setItem("project",JSON.stringify(project))
  }
  setUser(user:Usuario){
    localStorage.setItem("user",JSON.stringify(user))
  }

  getProject(){
    return JSON.parse(localStorage.getItem("project")!) as Proyecto
  }
  getUser(){
    return JSON.parse(localStorage.getItem("user")!) as Usuario | null
  }
}
