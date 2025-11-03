import { MongoClient, ObjectId } from "mongodb";
import { Mongoloid } from "./Mongoloid.js";
import { Catalogo, Pieza } from "@shared-types/Pieza.js";

export class CatalogoMongo extends Mongoloid{

    constructor(client:MongoClient){
        super("catalog",client)
    }

    async updateWithClient(piezas:Pieza[],catalogId:string){
        const nuevasPiezas = this.createCatalogo(piezas) as Catalogo
        const c = await this.getCollection("catalog")
        const catalogo = await c.findOne({ _id:new ObjectId(catalogId)}) as unknown as Catalogo
        catalogo.logs.push(...nuevasPiezas.logs)
        console.log(catalogo.logs.length)
        const r = await c.updateOne( 
            { _id:new ObjectId(catalogId)},
            {$set: {
                [`logs`]:catalogo.logs,
                'piezasCount':catalogo.logs.length
            }}
        )
        return {client:this.client,count:catalogo.logs.length,nuevas:nuevasPiezas.logs}
    }

    async createWithClient(piezas:Pieza[]){
        const catalogo = this.createCatalogo(piezas)
        const c = await this.getCollection("catalog")
        const insertResult = await c.insertOne(catalogo as any);
        const insertedId = insertResult.insertedId.toHexString()
        return {client:this.client,catalogId:insertedId}
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

    async deletePieza(catalogId:string,logs:Array<any>){
        const pc = await this.getCollection("catalog")
        const r = await pc.updateOne(
        { _id:new ObjectId(catalogId)},
        {$set: 
            {
                [`logs`]:logs
            }
        }
        )
        return r 
    
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

    createCatalogo(piezas:Pieza[]){
        const espejos:Pieza[] = []
        let errored = false
        piezas.forEach((p:Pieza)=>{
            try{
                const total = this.piezasAsNumber(p.piezas)
                const isEspejo = p.piezas.toUpperCase().includes("ESPEJO")
                p = this.fixPieza(p)
                
                if(total == 0 && isEspejo){
                    p.piezas = p.piezas.split("+")[0]!.trim()
                    const toPush = structuredClone(p)
                    toPush.title = `${toPush.title} (ESPEJO)`
                    toPush.isEspejo = true;
                    espejos.push(toPush)
                }
            }
            catch(e){
                errored = true
            }
            
        })
        piezas.push(...espejos)
        piezas = piezas.sort((a,b) => a.title.localeCompare(b.title));
        const catalogo:Catalogo = {
            logs:piezas,
            createdAt:new Date().toISOString()
        }
        if(errored) return false
        return catalogo
    }

    piezasAsNumber(val:string){
        if(/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val))return Number(val)
        return 0
    }

    fixPieza(p:Pieza){
        p.cantidadRechazada = []
        p.cantidadDetalle = []
        p.cantidadManufactura = []
        p.cantidadAlmacen = []
        p.cantidadRecibida = []
        p.fechaRecibida = []
        p.stock = []
        return p
    }
        
}