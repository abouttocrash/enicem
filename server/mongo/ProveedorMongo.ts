import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Usuario } from "@shared-types/Usuario.js";
import { Proveedor } from "@shared-types/Proveedor.js";

export class ProveedorMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("provider",client)
    }

    async getProvedores(){
        const p = await this.getAllItems<Usuario>("provider")
        return p
    }

    async editProveedor(user:Proveedor){
        let id = user._id
        delete user._id
        let r = await this.updateOne(user,"_id",new ObjectId(id))
        return r
    }
}