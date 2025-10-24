import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogOrdenComponent } from '../dialog-orden/dialog-orden.component';
import { Pieza } from '@shared-types/Pieza';
import { allPiezasAreFilled, isArrow, isF } from '../../utils/Utils';
import { ProyectoService } from '../../proyecto.service';
import { APIService } from '../../api.service';

@Component({
  selector: 'app-dialog-rechazo',
  imports: [MatSelectModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule,FormsModule],
  templateUrl: './dialog-rechazo.component.html',
  styleUrl: './dialog-rechazo.component.scss'
})
export class DialogRechazoComponent {
  piezas:Pieza[] = []
  razon = ""
  cantidad!:number
  data = inject<Pieza[]>(MAT_DIALOG_DATA);
  constructor(private dialog:MatDialogRef<DialogOrdenComponent>,private p:ProyectoService,public api:APIService){
    this.piezas = JSON.parse(JSON.stringify(this.data))
    this.piezas.forEach(p=>{
      p.max = this.max(p)
    })
  }

  actualizar(bool:boolean){
    this.dialog.close({razon:this.razon,piezas:this.piezas,bool:bool})
  }

  checkAmount($event:KeyboardEvent,plano:Pieza){
    const input = $event.target as HTMLInputElement;
    let value = ""
    if($event.key.length === 1)
      value = input.value + $event.key;
    const isValid = this.isValid(plano,Number(value))
    if (!/^\d*$/.test(value) && $event.key.length === 1 || !isValid || value == "0") {
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
            && $event.key != "Escape" 
            && !isArrow($event.key) 
            && $event.key != "Control")
          plano.cantidadInDialog = Number(value)
        }
  }

  private isValid(plano:Pieza,input:number){
    return input <= plano.max!? true:false
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
