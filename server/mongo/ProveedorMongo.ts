import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Usuario } from "@shared-types/Usuario.js";

export class ProveedorMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("users",client)
    }

    async getProvedores(){
        const p = await this.getAllItems<Usuario>("provider")
        return p
    }
}