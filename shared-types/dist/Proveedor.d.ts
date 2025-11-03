export interface Proveedor {
    _id?: string;
    name: string;
    tipo: "Detalle" | "Maquinado" | "Ambos";
    createdBy: string;
    createdAt: string;
    active: boolean;
    isActive?: string;
}
