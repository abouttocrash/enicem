import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Usuario } from "@shared-types/Usuario.js";

export class UsuarioMongo extends Mongoloid{
    private colors = [
        "#e76f51",
        "#31572c",
        "#197278",
        "#e9c46a",
        "#f26a8d",
        "#bc4749",
        "#415a77",
        "#a98467",
        "#76b041",
        "#eff1f3",
    ]
    constructor(client:MongoClient){
        super("users",client)
    }

    async getUsers(){
        const p = await this.getAllItems<Usuario>("users")
        return p
    }

    async createUser(user:any){
        const u = {
            name:user.name,
            code:user.code,
            rol:user.rol,
            short:this.setShort(user.name),
            color:this.colors[Number(user.code.charAt(0))]
        }
        const c = await this.getCollection("users")
        const insertResult = await c.insertOne(u);
        await this.client.close()
        return insertResult
    }


    private setShort(name:string){
        let short = ""
        const split = name.split(" ")
        try{
        short = `${split[0]!.charAt(0).toLocaleUpperCase()} ${split[1]!.charAt(0).toLocaleUpperCase()}`.trim().replace(" ","")
        }catch(e){
        short = `${split[0]!.charAt(0).toLocaleUpperCase()}`
        }
        return short
  }
}