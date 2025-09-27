import { Pieza } from "./Pieza"
export type StatusOrden = "ABIERTA"|"CERRADA"|"CANCELADA"| "INCOMPLETA"
export interface OrdenTrabajo {
    _id:string
    piezas:Array<Pieza>
    folio:string
    idProveedor:string
    proveedor:string
    dateEntrega:string
    tipo:"Maquinado" | "Detalle"
    idProject:string
    createdAt:string
    status:StatusOrden
    totalPiezas?:number
}