import { ObjectId, type MongoClient } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Proyecto } from "@shared-types/Proyecto.js";
import { Usuario } from "@shared-types/Usuario.js";

export class ProyectosMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("projects",client)
    }

    async getAll(status:string):Promise<any>{
        const p = await this.getAllItems("projects")
        const projectsResponse = p.filter((a:any)=>{
            return a.status == status
        })
        return projectsResponse
    }

    async createProject(proyecto:Proyecto,creador:Usuario){
        proyecto.createdBy = creador._id
        proyecto.createdAt = new Date().toISOString()
        proyecto.status = "ABIERTO"
        const p = await this.create(proyecto)
        const r = { insertedId: p.insertedId, createdAt: proyecto.createdAt }
        return r
    }

    async updateProject(updateObject:any,by:string,id:ObjectId){
        const r = await this.updateOne(updateObject,by,id)
        return r
    }

   
}