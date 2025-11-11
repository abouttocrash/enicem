import  { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { OrdenTrabajo } from '../../shared-types/OrdenTrabajo.js';
import { Pieza } from "@shared-types/Pieza.js";
import moment from "moment";
import { Proyecto } from "@shared-types/Proyecto.js";
import { Usuario } from "@shared-types/Usuario.js";
export class OrdenTrabajoMongo extends Mongoloid{
    constructor(client:MongoClient){
        super("orders",client)
    }
    //TODO
    async updateStatus(body:{status:string,id:string}){
        const dateReal = body.status == "CERRADA" ? new Date().toISOString():"-"
        const r = await this.updateOne({'status':body.status,'dateReal':dateReal},"_id",new ObjectId(body.id))
    }
    async updateOrden(orden:OrdenTrabajo,status:"RECIBIDA"|"RECHAZADA"){
        orden.piezas.forEach(p=>{
            delete p.checked
            p.status = status
        })
        const r = await this.updateOne({'piezas':orden.piezas},"_id",new ObjectId(orden._id))
        await this.client.close()
        return r
    }
    async updateDate(body:any){
        const r = await this.updateOne(
            {   dateEntrega:body.dateEntrega,
                razon:body.razon
            }
            ,"_id",new ObjectId(body.id))
        await this.client.close()
        return r
    }

    async getOrden(id:string){
        const r = await this.getOne("_id",new ObjectId(id)) as unknown as OrdenTrabajo
        r["totalPiezas"] = r.piezas.reduce((sum: number, p: any) => sum + Number(p.piezas), 0);
        return r
    }
    async getOrdenDetalleByFolio(folio: string): Promise<OrdenTrabajo | null> {
        // Busca por folio y tipo "Detalle"
        const r = await this.getManyObj<OrdenTrabajo>({ folio: folio, tipo: "Detalle" });
        if (!r || r.length === 0) return null;
        const ordenes = await this.asignarProveedor(r);
        return ordenes[0]!;
    }

    async getOrders(projectId:string){
        let r = await this.getMany<OrdenTrabajo>("idProject",projectId)
        r = await this.asignarProveedor(r)
        return r
    }
    async getOrdersbyProveedor(proveedorId:string,fechaInicial:string,fechaFinal:string){
        const obj= {
            "idProveedor": proveedorId,
            $expr: {
                $and: [
                    { $gte: [ { $dateFromString: { dateString: "$createdAt" } }, new Date(fechaInicial) ] },
                    { $lte: [ { $dateFromString: { dateString: "$createdAt" } }, new Date(fechaFinal) ] }
                ]
            }
            }
        let r = await this.getManyObj<OrdenTrabajo>(obj)
        r = await this.asignarProveedor(r,false)
        return r
    }
    async getOrdersbyFecha(fechaInicial:string,fechaFinal:string){
        const obj= {
            $expr: {
                $and: [
                    { $gte: [ { $dateFromString: { dateString: "$createdAt" } }, new Date(fechaInicial) ] },
                    { $lte: [ { $dateFromString: { dateString: "$createdAt" } }, new Date(fechaFinal) ] }
                ]
            }
            }
        let r = await this.getManyObj<OrdenTrabajo>(obj)
        r = await this.asignarProveedor(r,false)
        return r
    }

    async getOrdersView(query:any){
            
            const arr = [
                { $gte: [ { $dateFromString: { dateString: "$createdAt" } }, new Date(query.fecha1) ] },
                { $lte: [ { $dateFromString: { dateString: "$createdAt" } }, new Date(query.fecha2) ] }
            ]
            
            let obj = {
                "tipo": query.tipo,
                "status":query.status.toUpperCase(),
                $expr: {
                    $and: arr
                }
            
            }
            if(query.tipo == "Ambas")
                delete obj.tipo
            if(query.status == "Todos")
                delete obj.status

            
            let r = await this.getManyObj<OrdenTrabajo>(obj)
            r = await this.asignarProveedor(r)
            return r
    }


    async createOrden(body:any){
        body.piezas.forEach((pieza:Pieza)=>{
            delete pieza.checked
            pieza.cantidadAlmacen = []
            pieza.cantidadRechazada = []
            pieza.cantidadRecibida= []
            pieza.fechaRecibida = []
            pieza.cantidadManufactura = []
            pieza.cantidadDetalle = []
            pieza.cantidadInDialog = undefined
        })
        const obj = {
            piezas:body.piezas,
            status:"ABIERTA",
            folio:body.folio,
            idProveedor:body.idProveedor,
            dateEntrega:body.dateEntrega,
            tipo:body.tipo,
            idProject:body.idProject,
            createdAt: new Date().toISOString(),
            createdBy:body.user
        }
        const insertResult = await this.create(obj)
        await this.incrementFolio(obj.tipo)
        return insertResult
    }

    private async asignarProveedor(ordenes:OrdenTrabajo[],fechaBonita = true){
        let proveedores:Usuario[] = []
        if(fechaBonita)
            proveedores = await this.mongo.provider.getProvedores()
        const proyectos = await this.getAllItems<Proyecto>("projects")
        ordenes.forEach(o=>{
            if(fechaBonita)
             o.proveedor = proveedores.find(p=>{return p._id == o.idProveedor})?.name!
            o.project = proyectos.find(p=>{return p._id == o.idProject})!.name
            o.createdAt = moment(o.createdAt).locale("es").format("DD MMMM YYYY")
            if(fechaBonita)
            o.dateEntrega = moment(o.dateEntrega).locale("es").format("DD MMMM YYYY")
            if(o.dateReal != undefined && o.dateReal != "-"){
                o.dateReal = moment(o.dateReal).locale("es").format("DD MMMM YYYY")
            }
            const x = o.piezas.reduce((sum: number, p: any) => sum + Number(p.piezas), 0);
            o["totalPiezas"] = x
        })
        return ordenes
    }




}