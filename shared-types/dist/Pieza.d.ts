export interface Pieza {
    material: string;
    indices: string[];
    isEspejo: boolean;
    acabado: string;
    piezas: string;
    autor: string;
    title: string;
    registrado: number;
    checked?: boolean;
    status?: string;
    fechaRecibida: {
        c: number;
        fecha: string;
    }[];
    razonRechazo?: string;
    cantidadManufactura: number[];
    cantidadDetalle: number[];
    cantidadAlmacen: number[];
    cantidadRechazada: number[];
    cantidadRecibida: number[];
    cantidadInDialog?: number | undefined;
    base?: number;
    asociadas?: string[];
    max?: number;
    stock: Array<{
        c: number;
        t: string;
    }>;
    stockNumber?: number;
}
export interface CatalogoResponse {
    catalogId: string;
    projectId: string;
    userId: string;
    logId: string;
    piezasAdded: number;
}
export interface Catalogo {
    _id?: string;
    logs: Pieza[];
    createdAt: string;
}
