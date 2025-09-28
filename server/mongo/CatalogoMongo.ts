import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Catalogo } from "@shared-types/Pieza.js";

export class CatalogoMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("catalog",client)
    }

    async getCatalogo(id:string){
        if(id == undefined || id == "undefined")return [] as Catalogo[]
        const p = await this.getOne( "_id",new ObjectId(id))
        return p
    }
}