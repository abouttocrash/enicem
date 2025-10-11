import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pieza } from '@shared-types/Pieza';
import { allPiezasAreFilled } from '../../utils/Utils';

@Component({
  selector: 'app-dialog-recibir',
  imports: [],
  templateUrl: './dialog-recibir.component.html',
  styleUrl: './dialog-recibir.component.scss'
})
export class DialogRecibirComponent {
  piezas:Pieza[] = []
  cantidad!:number
  data = inject<Pieza[]>(MAT_DIALOG_DATA);
  constructor(private dialog:MatDialogRef<DialogRecibirComponent>){
    this.piezas = JSON.parse(JSON.stringify(this.data))
  }

  actualizar(bool:boolean){
    this.dialog.close({razon:"RECIBIR",piezas:this.piezas,bool:bool})
  }

  checkAmount($event:KeyboardEvent,plano:Pieza){
    const input = $event.target as HTMLInputElement;
    let value = ""
    if($event.key.length === 1)
      value = input.value + $event.key;
    const isValid = this.isValid(plano,Number(value))
    if (!/^\d*$/.test(value) && $event.key.length === 1 || !isValid) {
      $event.preventDefault();
    }
    else
      plano.cantidadInDialog = Number(value)
  }

  private isValid(plano:Pieza,input:number){
    return input <= this.max(plano)? true:false
  }

  max(plano:Pieza){
    return Number(plano.piezas) - (plano.cantidadInDialog || 0) - plano.cantidadRecibida!.reduce((sum, val) => sum + Number(val || 0), 0) 
  }

  allPiezasAreFilled(){
    return allPiezasAreFilled(this.piezas)
  }

  getMax(){
    return "Max "+this.max
  }
}
