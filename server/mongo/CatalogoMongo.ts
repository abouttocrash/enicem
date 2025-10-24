import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Catalogo, Pieza } from "@shared-types/Pieza.js";

export class CatalogoMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("catalog",client)
    }

    async getCatalogo(id:string){
        if(id == undefined || id == "undefined"){
            const empty:Catalogo = {
                logs:[],
                createdAt:""
            }
            return empty
        }
        const p = await this.getOne( "_id",new ObjectId(id))
        return p
    }


    async updateCatalog(body:{piezas:Pieza[],catalogId:string}){
        
            const responses:any[] = []
            const pc = await this.getCollection("catalog")
            const catalog = await this.getOne("_id",new ObjectId(body.catalogId)) as any
            for(let i = 0;i < body.piezas.length;i++){
                const pieza = body.piezas[i]!
                const attr = Number(pieza.cantidadInDialog)
                
                const piezaEnCatalogo = catalog.logs.find((c:any)=>{return c.title == pieza.title}) as Pieza
                piezaEnCatalogo.cantidadAlmacen.push(attr)
                await this.client.connect();
                const r = await pc.updateOne(
                { _id:new ObjectId(body.catalogId)},
                {$set: 
                    {
                        [`logs.$[x].cantidadAlmacen`]:piezaEnCatalogo.cantidadAlmacen
                    }
                },
                {
                    arrayFilters: [{"x.title": pieza.title}]
                })
                responses.push(r)
            }
            await this.client.close()
            return responses
        }
}