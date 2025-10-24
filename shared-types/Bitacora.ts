import { Usuario } from "./Usuario"

export enum MILESTONE_DESC {
    PROJECT_CREATED = "Proyecto creado",
    CATALOG_CREATED = "Bitácora creada",
    CATALOG_UPDATED = "Catálogo Actualizado",
    ORDER_MAQUI_CREATED = "Orden de Maquinado Creada",
    ORDER_DETAIL_CREATED = "Orden de Detalle Creada",
    ORDER_MAQUI_UPDATED = "Orden de Maquinado Actualizada",
    ORDER_DETAIL_UPDATED = "Orden DETALLE Actualizada",
    ORDER_MAQUI_CLOSED = "Orden de Maquinado Cerrada",
    ORDER_MAQUI_CANCELED = "Orden de Maquinado Cancelada",
    ORDER_DETAIL_CLOSED = "Orden de Detalle Cerrada",
    ORDER_DETAIL_CANCELED = "Orden de Detalle Cancelada"

}
export type Milestone = {
    description:string
    expand:boolean,
    createdAt?:string,
    generalId:string,
    updatedAt?:string
    createdBy?:string
    updatedBy?:string
    what?:Array<What>
    proveedor?:Usuario
}
export interface Bitacora{
    _id?:string | undefined
    projectId:string
    milestones:Milestone[]
    createdBy:string
    createdAt:string
    updatedAt:string
}

export interface What{
    cantidad:number,
    plano:string,
    material:string,
    acabado:string
    razon?:string,
}

export function createMilestone(description:string,generalId:string,createdBy:string,what:Array<What>,p:any,expand = true){
    console.log(expand)
    const milestone = {
        description:description,
        generalId:generalId,
        createdBy:createdBy,
        expand:expand,
        what:what,
        proveedor:p
    }
    return milestone
}