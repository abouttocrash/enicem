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
  data = inject<Pieza[]>(MAT_DIALOG_DATA);
  ultimoScan = ""
  piezasEnOrden:Pieza[] = []
  listener:any
  currentScan = ""
  enterFound = false
  inInput = false
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
  }

  async initSerial() {
    this.listener = (e: KeyboardEvent) => {
      if(this.inInput && e.key == "Shift"){
        document.getElementById("dialogh2")?.focus()
        this.inInput = false
      }
      if(!this.inInput)
        e.preventDefault()
      if(this.enterFound){
        this.currentScan = ""
        this.enterFound = false
      }
      if(e.key != "Shift" && e.key != "Enter" && !this.inInput && this.isValidKey(e.key))
        this.currentScan += e.key

      if(e.key == "Enter"){
        this.enterFound = true;
        this.ultimoScan = this.currentScan.replace("&","").replace(/\/H/g, "(").replace(/\/I/g, ")").trim().toUpperCase();
        const pieza = this.o.currentOrden?.piezas.find(p=>{
        return p.title.toUpperCase() == this.ultimoScan
      })
      let piezaExists = false
      if(pieza)
      piezaExists = this.piezas.find(p=>{return p.title == pieza!.title}) != undefined
      if(pieza && !piezaExists){
        if(pieza.max == 0){
          this.ultimoScan = `Plano ${this.ultimoScan} ya recibida`
        }
        else
          this.piezas.push(pieza)
      }
      else{
        if(piezaExists)
          this.ultimoScan = `Plano ${this.ultimoScan} duplicada`
          else
        this.ultimoScan = `Plano ${this.ultimoScan} no encontrado`
      }
        console.log("Clean: "+this.ultimoScan);
        console.log("Found: "+this.currentScan)

      }
      
    };
    document.addEventListener('keydown', this.listener as EventListener);

  }

  async actualizar(bool:boolean){
    
    if (this.listener) {
      document.removeEventListener('keydown', this.listener as EventListener);
      this.listener = null;
    }
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
  isValidKey(key:string){
    let isValid = true
    switch(key){
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
      case "Escape":
      case "BackSpace":
      case "ContextMenu":
      case "Alt":
      case "Tab":
      case "Esc":
      case "Meta":
      case "Control": isValid = false;break;
    }
    return isValid
  }
}
