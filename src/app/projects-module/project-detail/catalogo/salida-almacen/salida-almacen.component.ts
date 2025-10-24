import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pieza } from '@shared-types/Pieza';
import { allPiezasAreFilled, isArrow, isF } from '../../../../utils/Utils';

@Component({
  selector: 'app-salida-almacen',
  imports: [CommonModule,FormsModule],
  templateUrl: './salida-almacen.component.html',
  styleUrl: './salida-almacen.component.scss'
})
export class SalidaAlmacenComponent {
  piezas:Pieza[] = []
  cantidad!:number
  data = inject<Pieza[]>(MAT_DIALOG_DATA);
  constructor(private dialog:MatDialogRef<SalidaAlmacenComponent>){
    this.piezas = JSON.parse(JSON.stringify(this.data))
    this.piezas.forEach(p=>{
      p.max = this.manufactured(p) 
    })
  }

  actualizar(bool:boolean){
    this.dialog.close({piezas:this.piezas,bool:bool})
  }

  checkAmount($event:KeyboardEvent,plano:Pieza){
    const input = $event.target as HTMLInputElement;
    let value = ""
    if($event.key.length === 1)
      value = input.value + $event.key;
    const isValid = this.isValid(plano,Number(value))
    if (!/^\d*$/.test(value) && $event.key.length === 1 || !isValid  ) {
      $event.preventDefault();
    }
    else{
          if(
            $event.key != "Tab" 
            && $event.key != "Alt" 
            && $event.key != "CapsLock" 
            && $event.key != "Enter" 
            && $event.key != "Meta" 
            && $event.key != "Shift" 
            && $event.key != "ContextMenu" 
            && $event.key != "Insert" 
            && $event.key != "Home" 
            && $event.key != "End" 
            && $event.key != "PageUp" 
            && $event.key != "PageDown" 
            && $event.key != "Delete" 
            && !isF($event.key) 
            && !isF($event.key) 
            && $event.key != "Escape" 
            && $event.key != "Control")
          plano.cantidadInDialog = Number(value)
        }
  }

  private isValid(plano:Pieza,input:number){
    return input <=plano.max! ? true:false
  }

  max(plano:Pieza){
    return Number(this.manufactured(plano) ) - (plano.cantidadInDialog || 0)
  }

  manufactured(plano:Pieza){
    return plano.stock.map(s=>{return s.c})!.reduce((sum, val) => sum + Number(val || 0), 0)
  }


  

  allPiezasAreFilled(){
    return allPiezasAreFilled(this.piezas)
  }
  getMax(){
    return "Max "+this.max
  }
}
