import { Usuario } from "./Usuario";
export interface Proyecto {
    _id?: string;
    name: string;
    createdBy?: string;
    noSerie: string;
    idUser?: string;
    createdAt?: string;
    status?: string;
    catalogId?: string;
    designer?: Usuario;
    ordenesCount?: number;
    piezasCount?: number;
}
