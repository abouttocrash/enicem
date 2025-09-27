import type { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Bitacora } from "@shared-types/Bitacora.js";

export class BitacoraMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("logs",client)
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