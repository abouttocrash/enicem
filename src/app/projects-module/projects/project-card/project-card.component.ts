import { Component, input, InputSignal, model, ModelSignal, output, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Proyecto } from '@shared-types/Proyecto';

@Component({
  selector: 'project-card',
  imports: [MatIconModule,DatePipe,MatMenuModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss'
})
export class ProjectCardComponent {
  cardSelected = output<InputSignal<Proyecto>>()
  detailsClicked = output()
  foldersClicked = output()
  project = model.required<Proyecto>()
  menuTrigger = viewChild(MatMenuTrigger);
  constructor(){}

  hasLog(){
    if(!this.project())return false
    else{
      if(this.project().piezasCount)return true
      else return false
    }
  }
  getCountText(){
    const b = this.project().piezasCount? this.project().piezasCount!:0
    switch(true){
      case b == 0:return "Sin Planos";
      case b > 1: return b+" Planos";
      case b == 1: return b+ "Plano";
      default: return ""

    }
  }
  getOrdenesText(){
    const b =  this.project().ordenesCount? this.project().ordenesCount! :0
    switch(true){
      case b == 0:return "Sin Ordenes";
      case b > 1: return b+" Ordenes";
      case b == 1: return b+ " Orden";
      default: return ""

    }
  }
}
