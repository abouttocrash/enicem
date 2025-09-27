export declare enum MILESTONE_DESC {
    PROJECT_CREATED = "PROYECTO CREADO",
    CATALOG_CREATED = "CATALOGO CREADO",
    CATALOG_UPDATED = "CATALOGO ACTUALIZADO",
    ORDER_MAQUI_CREATED = "ORDEN MAQUINADO CREADA",
    ORDER_DETAIL_CREATED = "ORDEN DETALLE CREADA",
    ORDER_MAQUI_UPDATED = "ORDEN MAQUINADO ACTUALIZADA",
    ORDER_DETAIL_UPDATED = "ORDEN DETALLE ACTUALIZADA",
    ORDER_MAQUI_CLOSED = "ORDEN MAQUINADO CERRADA",
    ORDER_MAQUI_CANCELED = "ORDEN MAQUINADO CANCELADA",
    ORDER_DETAIL_CLOSED = "ORDEN DETALLE CERRADA",
    ORDER_DETAIL_CANCELED = "ORDEN DETALLE CANCELADA"
}
export type Milestone = {
    description: string;
    expand: boolean;
    createdAt?: string;
    generalId: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    what?: Array<any>;
};
export interface Bitacora {
    _id?: string | undefined;
    projectId: string;
    milestones: Milestone[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export declare function createMilestone(description: string, generalId: string, createdBy: string, what: Array<any>, expand?: boolean): {
    description: string;
    generalId: string;
    createdBy: string;
    expand: boolean;
    what: any[];
};
