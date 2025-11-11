import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Salida } from "@shared-types/Salida.js";
import moment from "moment";

export class SalidaMongo extends Mongoloid{
   
    constructor(client:MongoClient){
        super("out",client)
    }

    async createSalida(salida:any){
        const p = await this.create(salida)
        return p
    }

    async updateSalida(salida:any){
        const r = await this.updateOne({
            status:salida.status,
            razon:salida.razon,
            modifiedBy:salida.modifiedBy,
            modifiedDate: salida.modifiedDate
        },"_id",new ObjectId(salida._id))
        return r
    }
    async updateSalidaCantidad(salida:any){
        const r = await this.updateOne({salidas:salida.salidas},"_id",new ObjectId(salida._id))
        return r
    }
    
    async getSalidas(id:string){
        let r = await this.getMany<Salida>("projectId",id)
         r = r.filter(d=>{
            d.fechaSalida = moment(d.fechaSalida).locale("es").format("DD MMMM YYYY")
            return d
        })
        return r
    }
    async getAllSalidas(query:any){
        let obj = {}
        const arr = [
            { $gte: [ { $dateFromString: { dateString: "$fechaSalida" } }, new Date(query.fecha1) ] },
            { $lte: [ { $dateFromString: { dateString: "$fechaSalida" } }, new Date(query.fecha2) ] }
        ]
        if(query.tipo == "Ambas"){
            obj = {
                $expr: {
                    $and: arr
                }
            }
        }
        else{
            obj = {
            "tipo": query.tipo,
            $expr: {
                $and: arr
            }
        }
        }
        
        let r = await this.getManyObj<any>(obj)
        r = r.filter(d=>{
            d.fechaSalida = moment(d.fechaSalida).locale("es").format("DD MMMM YYYY")
            return d.tipo != "Scrap"
        })
        return r
    }

   
}