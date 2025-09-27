export interface Pieza {
    _id: string;
    material: string;
    acabado: string;
    piezas: string;
    autor: string;
    title: string;
    registrado: number;
    checked?: boolean;
    status?: string;
    fechaRecibida: string;
    razon: string;
    cantidadRechazada: number;
}
