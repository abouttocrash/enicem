import { ObjectId, type MongoClient } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Proyecto } from "@shared-types/Proyecto.js";
import { Usuario } from "@shared-types/Usuario.js";
import moment from "moment";
import { pBlue, printToLog, pYellow } from "../Printer.js";
export type Status = "ABIERTO" | "CERRADO" | "CANCELADO"
export class ProyectosMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("projects",client)
    }

    async getAll(status:Status):Promise<Proyecto[]>{
        const p = await this.getAllItems<Proyecto>("projects")
        const projectsResponse = p.filter((a:Proyecto)=>{
            return a.status == status
        })
        return projectsResponse
    }
    async getAllNoFilter():Promise<Proyecto[]>{
        const p = await this.getAllItems<Proyecto>("projects")
        
        return p
    }

    async createProject(proyecto:Proyecto,creador:Usuario){
        proyecto.createdBy = creador._id
        proyecto.createdAt = moment().endOf("D").toISOString()
        proyecto.status = "ABIERTO"
        const p = await this.create(proyecto)
        const r = { insertedId: p.insertedId, createdAt: proyecto.createdAt }
        return r
    }

    async updateProject(updateObject:any,by:string,id:ObjectId){
        const r = await this.updateOne(updateObject,by,id)
        return r
    }
    async updateProjectWithClient(updateObject:any,by:string,id:ObjectId,client:MongoClient){
        printToLog(` • Actualizando # de ordenes - proyecto ${pYellow(id)}`)
        const r = await this.updateOneWithClient(client,updateObject,by,id)
        return r
    }
    async deleteProject(projectId:string){
        const c = await this.getCollection("projects")
        const r = await c.deleteOne({"_id":new ObjectId(projectId)})
        await this.client.close()
        return r
    }
    async updateCatalogInProject(updateObject:any,by:string,id:ObjectId,client:MongoClient){
        const byObj = {[by]:id}
        const pc = await this.getCollectionWithClient("projects",client)
        const r = await pc.updateOne(byObj,{ $set:updateObject})
        return r
    }

   
}