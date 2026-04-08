import { Pieza } from "./Pieza";

export interface Salida{
    pieza:string,
    folio:string,
    folioOrden:string,
    piezas:number,
    tipo:string,
    fechaSalida:string,
    projectId:string,
    idUsuario:string,
    usuario:string,
    material:string,
    acabado:string,
    status?:string,
    salidas?:Salida[];
    placeholder?:string
    max?:number
    inSalida?:number
}