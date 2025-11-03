import { Usuario } from "./Usuario";
export declare enum MILESTONE_DESC {
    PROJECT_CREATED = "Proyecto creado",
    CATALOG_CREATED = "Bit\u00E1cora creada",
    CATALOG_UPDATED = "Cat\u00E1logo Actualizado",
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
    description: string;
    expand: boolean;
    createdAt?: string;
    generalId: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    what?: Array<What>;
    proveedor?: Usuario;
};
export interface Bitacora {
    _id?: string | undefined;
    projectId: string;
    milestones: Milestone[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface What {
    cantidad: number;
    plano: string;
    material: string;
    acabado: string;
    razon?: string;
}
export declare function createMilestone(description: string, generalId: string, createdBy: string, what: Array<What>, p: any, expand?: boolean): {
    description: string;
    generalId: string;
    createdBy: string;
    expand: boolean;
    what: What[];
    proveedor: any;
};
