
import { MatDialogConfig } from "@angular/material/dialog";
import { Pieza } from "@shared-types/Pieza";
import { Proyecto } from "@shared-types/Proyecto";

export const baseDialog = {
  width:"500px",
  height:"600px",
  disableClose:true
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