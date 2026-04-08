import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pieza } from '@shared-types/Pieza';
import { allPiezasAreFilled, isF, sum } from '../../../../utils/Utils';
import { SalidaService } from '../../../../salida.service';
import { APIService } from '../../../../api.service';
import { Salida } from '@shared-types/Salida';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-salida-almacen',
  imports: [CommonModule,FormsModule,MatIconModule,MatTooltipModule],
  templateUrl: './salida-almacen.component.html',
  styleUrl: './salida-almacen.component.scss'
})
export class SalidaAlmacenComponent {
  piezas:Pieza[] = []
  cantidad!:number
  data = inject<Pieza[]>(MAT_DIALOG_DATA);
  arraySalidas:Salida[] = []
  constructor(private dialog:MatDialogRef<SalidaAlmacenComponent>,private s:SalidaService,private api:APIService){
    this.piezas = JSON.parse(JSON.stringify(this.data))
    
  }
  async ngAfterViewInit(){
    this.arraySalidas = await (await this.s.getSalidasAbiertasParaProyecto(this.api.currentProject._id!)).data
    this.piezas.forEach(p=>{
      p.max = this.manufactured(p) - this.getEnSalida(p)
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
    return Number(this.manufactured(plano) ) - (plano.cantidadInDialog || 0) - this.getEnSalida(plano)
  }

  private getEnSalida(plano:Pieza){
     const piezasEnSalida = this.arraySalidas.map(s2=>{
      return s2.salidas
    })
    .flat()
    .filter(p2=>{return p2!.pieza == plano.title})
    const suma = sum(piezasEnSalida.map(p=>{return p!.piezas}))
    if(suma > 0)
       plano.inSalida = suma
    return suma
  }
  manufactured(plano:Pieza){
    return plano.stock.map(s=>{return s.c})!.reduce((sum, val) => sum + Number(val || 0), 0)
  }

  getTooltip(plano:Pieza){
    return `Hay ${plano.inSalida} piezas esperando salida`
  }

  

  allPiezasAreFilled(){
    return allPiezasAreFilled(this.piezas)
  }
  getMax(){
    return "Max "+this.max
  }
}
