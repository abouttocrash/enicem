import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pieza } from '@shared-types/Pieza';
import { allPiezasAreFilled, isArrow, isF } from '../../utils/Utils';
import { CatalogoService } from '../../catalogo.service';
import { OrdenesService } from '../ordenes.service';

@Component({
  selector: 'app-dialog-recibir',
  imports: [],
  templateUrl: './dialog-recibir.component.html',
  styleUrl: './dialog-recibir.component.scss'
})
export class DialogRecibirComponent {
  piezas:Pieza[] = []
  cantidad!:number
  device!:any
  data = inject<Pieza[]>(MAT_DIALOG_DATA);
  ultimoScan = ""
  piezasEnOrden:Pieza[] = []
  constructor(private dialog:MatDialogRef<DialogRecibirComponent>,private o:OrdenesService){
    if(this.data.length == 0){
      this.piezasEnOrden = o.currentOrden!.piezas
    }
    this.piezas = JSON.parse(JSON.stringify(this.data))
    this.piezas.forEach(p=>{
      p.max = this.max(p)
    })
    this.piezasEnOrden.forEach(p=>{
      p.max = this.max(p)
    })
  }

  async ngAfterViewInit(){
    if(this.data.length == 0)
      await this.initSerial()
    else
      this.device = undefined
  }

  async initSerial() {
    [this.device] = await navigator.hid.requestDevice({
      filters: []
    });
    if(this.device == undefined)
      return await this.actualizar(false)
    await this.device.open();
    this.device.addEventListener("inputreport", (event:any) => {
      const { data } = event;
      const value = data as DataView
      const decoder = new TextDecoder('utf-8');
      const myString = decoder.decode(value, {});
      console.log("Lectura: "+myString)
      const cleaned = myString.replace(/[\x00-\x1F\x7F]/g, '');
      this.ultimoScan = cleaned.replace("&","").replace(/\/H/g, "(").replace(/\/I/g, ")").trim();
      console.log("Clean: "+this.ultimoScan);
      const pieza = this.o.currentOrden?.piezas.find(p=>{
        return p.title == this.ultimoScan
      })
      if(pieza){
        this.piezas.push(pieza)
      }
      else{
        this.ultimoScan = `Plano ${cleaned} no encontrado`
      }
    });
  }

  async actualizar(bool:boolean){
    if(this.device != undefined)
      await this.device.close()
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
    if(this.piezas.length == 0) return false
    return allPiezasAreFilled(this.piezas)
  }

  getMax(){
    return "Max "+this.max
  }
}
