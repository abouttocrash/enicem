import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogSalidaComponent } from '../dialog-salida/dialog-salida.component';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../catalogo.service';
import { Pieza } from '@shared-types/Pieza';
import { Salida } from '@shared-types/Salida';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from "@angular/material/tooltip";
import { isF, sum } from '../utils/Utils';
import { SalidaService } from '../salida.service';
import { APIService } from '../api.service';

@Component({
  selector: 'app-dialog-editar-salida',
  imports: [FormsModule, MatIconModule, MatTooltip],
  templateUrl: './dialog-editar-salida.component.html',
  styleUrl: './dialog-editar-salida.component.scss'
})
export class DialogEditarSalidaComponent {
  data = inject<any>(MAT_DIALOG_DATA);
  inSalida:Pieza[] = []
  arraySalidas:Salida[] = []
  constructor(private dialog:MatDialogRef<DialogSalidaComponent>,
    private c:CatalogoService, private s:SalidaService,private api:APIService){
    
   
  }

  async ngAfterViewInit(){
    this.arraySalidas = await (await this.s.getSalidasAbiertasParaProyecto(this.api.currentProject._id!)).data
    this.data.salidas.forEach((salida:Salida)=>{
      
      const inCatalogo = this.c.dataSource.data.find(s=>{
        return s.title == salida.pieza
      })
      
      salida.placeholder = (salida.piezas).toString()
      this.inSalida.push(inCatalogo!)
      salida.inSalida = this.getPlaceholder(salida).enSalida
    })
  }

   actualizar(bool:boolean){
    this.dialog.close({data:this.data,bool:bool})
  }

  getPlaceholder(plano:Salida){
    const p = this.inSalida.find(s=>{
      return s.title == plano.pieza
    })
    plano.max = p?.stockNumber || 0
    const enStock = p?.stockNumber!
    const enSalida =  this.getEnSalida(p!)
    return {enStock,enSalida}
  }

  getTooltip(plano:Salida){
    return `Solicitadas: ${plano.placeholder}. En Stock: ${this.getPlaceholder(plano).enStock}`
  }

  checkAmount($event:KeyboardEvent,plano:Salida){
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
            plano.piezas = Number(value)
          }
  }

  private isValid(plano:Salida,input:number){
    const p = this.inSalida.find(s=>{return s.title == plano.pieza})
    return input <=plano.max! - this.getEnSalida(p!) ? true:false
  }

  allPiezasAreFilled(){
    let valid = true
    this.data.salidas.forEach((p:Salida) => {
      if(p.piezas == undefined || p.piezas == 0 ){
        valid = false;
        return
      }
    });
    return valid
  }

  private getEnSalida(plano:Pieza){
      const piezasEnSalida = this.arraySalidas
      .filter((s:any)=>{
      return s._id != this.data._id
      })
      .map(s2=>{
      return s2.salidas
    })
    .flat()
    .filter(p2=>{return p2!.pieza == plano.title})
    const suma = sum(piezasEnSalida.map(p=>{return p!.piezas}))
    if(suma > 0)
        plano.inSalida = suma
    return suma
  }
  getTooltipSalida(plano:Pieza){
    return `Hay ${plano.inSalida} piezas esperando salida`
  }
}
