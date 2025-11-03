import { Pieza } from "./Pieza";
export type StatusOrden = "ABIERTA" | "CERRADA" | "CANCELADA" | "INCOMPLETA";
export interface OrdenTrabajo {
    _id: string;
    piezas: Array<Pieza>;
    folio: string;
    idProveedor: string;
    proveedor: string;
    dateEntrega: string;
    tipo: "Maquinado" | "Detalle";
    idProject: string;
    project?: string;
    createdAt: string;
    status: StatusOrden;
    totalPiezas?: number;
    cantidadRecibida: number;
    cantidadRechazada: number;
    dateReal?: string;
    missed?: number;
    notMissed?: number;
}
