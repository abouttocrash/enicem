import { Injectable } from '@angular/core';
import { Proyecto } from '@shared-types/Proyecto';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  setProject(project:Proyecto){
    console.log(project)
    localStorage.setItem("project",JSON.stringify(project))
  }

  getProject(){
    return JSON.parse(localStorage.getItem("project")!)
  }
}
