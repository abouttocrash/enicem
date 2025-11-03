
import { CdkDropList, CdkDrag } from "@angular/cdk/drag-drop";
import { FormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogConfig } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { What } from "@shared-types/Bitacora";
import { Pieza } from "@shared-types/Pieza";
import { Proyecto } from "@shared-types/Proyecto";

export const ViewsImports =[
  MatTableModule, MatIconModule, MatSortModule, MatTooltipModule,
  MatSelectModule, FormsModule, MatFormFieldModule,
  MatInputModule, CdkDropList, CdkDrag, MatDatepickerModule
]

export const baseDialog = {
  width:"500px",
  height:"600px",
  disableClose:true
} as MatDialogConfig<any[]>
export const longDialog = {
  ...baseDialog,
  width:"800px"
} as MatDialogConfig<any[]>
export const longerDialog = {
  height:"820px",
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

export function createWhat(piezas:any[], attrCantidad:string){
    const what:Array<What> = []
    piezas.forEach(p=>{
      what.push({
        plano:p.title || p.pieza,
        material:p.material,
        acabado:p.acabado,
        cantidad: p[attrCantidad as keyof Pieza] as number,
        razon:p.razonRechazo
      })
    })
    return what
  }

export function isF(eventKey:string){
  return /^F([1-9]|1[0-2])$/i.test(eventKey);
}
export function isArrow(eventKey:string){
  return eventKey.includes("Arrow")
}