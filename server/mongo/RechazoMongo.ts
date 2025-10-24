import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Rechazo } from "@shared-types/Rechazo.js";
import moment from "moment";

export class RechazoMongo extends Mongoloid{
   
    constructor(client:MongoClient){
        super("rechazo",client)
    }

    async createRechazo(obj:any){
        const r = await this.create(obj)
        return r
    }

    async getRechazos(){
        const rechazos = await this.getAllItems<Rechazo>("rechazo")
        return rechazos
    }

    async editRechazo(rechazo:Rechazo){
        console.log(rechazo)
        let id = rechazo._id
        delete rechazo._id
        let r = await this.updateOne(rechazo,"_id",new ObjectId(id))
        return r
    }

    

   
}