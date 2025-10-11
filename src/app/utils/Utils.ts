
import { MatDialogConfig } from "@angular/material/dialog";
import { What } from "@shared-types/Bitacora";
import { Pieza } from "@shared-types/Pieza";
import { Proyecto } from "@shared-types/Proyecto";

export const baseDialog = {
  width:"500px",
  height:"600px",
  disableClose:true
} as MatDialogConfig<any[]>
export const longDialog = {
  ...baseDialog,
  width:"800px"
} as MatDialogConfig<any[]>


export function allPiezasAreFilled(list:Pieza[]){
  let valid = true
  list.forEach((p:Pieza) => {
    if(p.cantidadInDialog == undefined || p.cantidadInDialog == 0 ){
      valid = false;
      return
    }
    
  });
  return valid
}

export function projectDisabled(){
  const p = JSON.parse(localStorage.getItem("project")!) as Proyecto
  return p.status != "ABIERTO"
}

export function sum(array:number[]){
 return array.reduce((sum: number, p: number) => sum + p, 0);
}

export function createWhat(piezas:Pieza[], attrCantidad:string){
    const what:Array<What> = []
    piezas.forEach(p=>{
      what.push({
        plano:p.title,
        material:p.material,
        acabado:p.acabado,
        cantidad: p[attrCantidad as keyof Pieza] as number,
        razon:p.razonRechazo
      })
    })
    return what
  }