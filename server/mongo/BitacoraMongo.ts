import type { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Bitacora } from "@shared-types/Bitacora.js";
import { Mongo } from "../Mongo.js";

export class BitacoraMongo extends Mongoloid{
    mongo = Mongo.instance
    constructor(client:MongoClient){
        super("logs",client)
    }

    async getBitacora(projectId:string){
        const p = await this.getOne("projectId",projectId) as unknown as Bitacora
        const users = await this.mongo.user.getUsers()
        p.milestones.forEach((m:any)=>{
            const u = users.find((u)=>{return u._id.toString() == m.createdBy}) as any
            m.usuario = u.name
        })
        return p as unknown as Bitacora
    }

    async createBitacora(projectId:ObjectId,creadorId:string){
        const date = new Date()
        const log:Bitacora = {
        projectId:projectId.toString(),
        createdAt:date.toISOString(),
        updatedAt:date.toISOString(),
        createdBy:creadorId,
            milestones:[{
                description:"PROYECTO CREADO",
                createdAt:date.toISOString(),
                updatedAt:date.toISOString(),
                generalId: projectId.toString(),
                createdBy:creadorId,
                updatedBy:creadorId,
                expand:false,
            }]
        }
        await this.create(log)
    }
}