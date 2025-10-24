import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pieza } from '@shared-types/Pieza';
import { allPiezasAreFilled } from '../../../../utils/Utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialogo-scrap',
  imports: [CommonModule,FormsModule,MatFormFieldModule,MatInputModule],
  templateUrl: './dialogo-scrap.component.html',
  styleUrl: './dialogo-scrap.component.scss'
})
export class DialogoScrapComponent {
  piezas:Pieza[] = []
  cantidad!:number
  data = inject<Pieza[]>(MAT_DIALOG_DATA);
  comentario = ""
  constructor(private dialog:MatDialogRef<DialogoScrapComponent>){
    this.piezas = JSON.parse(JSON.stringify(this.data))
    this.piezas.forEach(p=>{
      p.max = this.manufactured(p) 
    })
  }

  actualizar(bool:boolean){
    this.piezas.forEach(p=>{
      p.razonRechazo = this.comentario
    })
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
    else
      plano.cantidadInDialog = Number(value)
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
