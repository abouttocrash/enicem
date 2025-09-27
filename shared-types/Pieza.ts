export interface Pieza{
    material:string
    indices:string[]
    acabado:string
    piezas:string
    autor:string
    title:string
    registrado:number // La cantidad que viene en el PDF
    checked?:boolean
    status?:string
    fechaRecibida?:string
    razonRechazo?:string
    cantidadManufactura:number[] //La cantidad que se fue a manufactura
    cantidadDetalle:number[] // La cantidad que se fue a detalle
    cantidadAlmacen:number[] // La cantidad que se fue a almacen
    cantidadRechazada:number[]
    cantidadRecibida:number[]
    cantidadInDialog?:number
    
}

export interface Catalogo {
    _id?:string,
    logs:Pieza[],
    createdAt:string
}