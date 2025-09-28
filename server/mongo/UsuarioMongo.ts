import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Usuario } from "@shared-types/Usuario.js";

export class UsuarioMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("users",client)
    }

    async getUsers(){
        const p = await this.getAllItems<Usuario>("users")
        return p
    }
}