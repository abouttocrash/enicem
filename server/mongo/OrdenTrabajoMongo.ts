import  { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { OrdenTrabajo } from '../../shared-types/OrdenTrabajo.js';
import { Pieza } from "@shared-types/Pieza.js";
export class OrdenTrabajoMongo extends Mongoloid{
    constructor(client:MongoClient){
        super("orders",client)
    }

    async updateStatus(body:{status:string,id:string}){
        const dateReal = body.status == "CERRADA" ? new Date().toISOString():"-"
        const r = await this.updateOne({'status':body.status,'dateReal':dateReal},"_id",new ObjectId(body.id))
    }
    async updateOrden(orden:OrdenTrabajo,status:"RECIBIDA"|"RECHAZADA"){
        orden.piezas.forEach(p=>{
            delete p.checked
            p.status = status
            p.fechaRecibida = new Date().toISOString()
            
        })
        const r = await this.updateOne({'piezas':orden.piezas},"_id",new ObjectId(orden._id))
        await this.client.close()
        return r
    }

    async getOrden(id:string){
        const r = await this.getOne("_id",new ObjectId(id))
        return r
    }

    async getOrders(projectId:string){
        const r = await this.getMany<OrdenTrabajo>("idProject",projectId)
        const proveedores = await this.mongo.provider.getProvedores()
        r.forEach(o=>{
            o.proveedor = proveedores.find(p=>{return p._id == o.idProveedor})?.name!
            const x = o.piezas.reduce((sum: number, p: any) => sum + Number(p.piezas), 0);
            o["totalPiezas"] = x
        })
        return r
    }


    async createOrden(body:any){
        body.piezas.forEach((pieza:Pieza)=>{
            delete pieza.checked
        })
        const obj = {
            piezas:body.piezas,
            status:"ABIERTA",
            folio:body.folio,
            idProveedor:body.idProveedor,
            dateEntrega:body.dateEntrega,
            tipo:body.tipo,
            idProject:body.idProject,
            createdAt: new Date().toISOString()
        }
        const insertResult = await this.create(obj)
        await this.incrementFolio(obj.tipo)
        return insertResult
    }




}