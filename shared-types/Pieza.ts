import { OrdenTrabajo } from "./OrdenTrabajo"

export interface Pieza{
    material:string
    indices:string[]
    isEspejo:boolean
    acabado:string
    piezas:string
    autor:string
    title:string
    registrado:number // La cantidad que viene en el PDF
    checked?:boolean
    status?:string
    fechaRecibida:{c:number,fecha:string}[]
    razonRechazo?:string
    cantidadManufactura:number[] //La cantidad que se fue a manufactura
    cantidadDetalle:number[] // La cantidad que se fue a detalle
    cantidadAlmacen:number[] // La cantidad que se fue a almacen
    cantidadRechazada:number[]
    cantidadRecibida:number[]
    cantidadInDialog?:number | undefined
    base?:number//para calcular equipos
    asociadas?:string[]
    max?:number
    stock:Array<{c:number,t:string}>
    
}

export interface Catalogo {
    _id?:string,
    logs:Pieza[],
    createdAt:string
}