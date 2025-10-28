import {MongoClient,ObjectId} from 'mongodb'
import { OrdenTrabajoMongo } from './mongo/OrdenTrabajoMongo.js';
import { BitacoraMongo } from './mongo/BitacoraMongo.js';
import {  Milestone, What } from '@shared-types/Bitacora.js';
import { ProyectosMongo } from './mongo/ProyectosMongo.js';
import { Catalogo, Pieza } from '@shared-types/Pieza.js';
import { Proveedor} from '@shared-types/Proveedor.js';
import { CatalogoMongo } from './mongo/CatalogoMongo.js';
import { UsuarioMongo } from './mongo/UsuarioMongo.js';
import { ProveedorMongo } from './mongo/ProveedorMongo.js';
import { SalidaMongo } from './mongo/SalidaMongo.js';
import moment from 'moment';
import { RechazoMongo } from './mongo/RechazoMongo.js';
export type Collection = "logs"|"projects"|"catalog"|"orders"|"users" | "provider" | "folio" | "almacen" |"out" | "roles" | "rechazo"
export class Mongo{
    private url = 'mongodb://localhost:27017';
    private client!:MongoClient
    private dbName = 'icem';
    static #instance: Mongo;
    orders!:OrdenTrabajoMongo
    logs!:BitacoraMongo
    projects!:ProyectosMongo
    catalog!:CatalogoMongo
    user!:UsuarioMongo
    provider!:ProveedorMongo
    salida!:SalidaMongo
    rechazo!:RechazoMongo
    public static get instance(): Mongo {
        if (!Mongo.#instance) {
            Mongo.#instance = new Mongo();
            this.#instance.client =  new MongoClient(this.#instance.url);
            Mongo.#instance.orders = new OrdenTrabajoMongo(this.#instance.client)
            Mongo.#instance.projects = new ProyectosMongo(this.#instance.client)
            Mongo.#instance.logs = new BitacoraMongo(this.#instance.client)
            Mongo.#instance.catalog = new CatalogoMongo(this.#instance.client)
            Mongo.#instance.user = new UsuarioMongo(this.#instance.client)
            Mongo.#instance.provider = new ProveedorMongo(this.#instance.client)
            Mongo.#instance.salida = new SalidaMongo(this.#instance.client)
            Mongo.#instance.rechazo = new RechazoMongo(this.#instance.client)
        }
        return Mongo.#instance;
    }
    async updateLog(body:any){
        const date = new Date()
        const milestone:Milestone = body.milestone
        milestone.expand = body.expand
        milestone.createdAt = date.toISOString()
        milestone.updatedAt =  date.toISOString()
        milestone.generalId = milestone.generalId!
        const pc = await this.getCollection("logs")
        const r = await pc.updateOne(
        { projectId:body.projectId},
        { $push: { milestones: milestone as any } })
        await this.client.close()
        return r
    }

    async updateStock(body:any){
        const responses:any[] = []
        const piezas = body.piezas as What[]
        const catalogId = body.catalogId as string
        const razon = body.razon as string
        const pc = await this.getCollection("catalog")
        const catalog = await this.getCatalog(catalogId) as any
        for(let i = 0;i < piezas.length;i++){
            const pieza = piezas[i]!
            const piezaEnCatalogo = catalog.logs.find((c:any)=>{return c.title == pieza.plano}) as Pieza
            const cantidad = razon.includes("ENTRADA")? Number(pieza.cantidad) : pieza.cantidad * -1
            piezaEnCatalogo.stock.push({c:cantidad ,t:razon})
            await this.client.connect();
            const r = await pc.updateOne(
            { _id:new ObjectId(catalogId)},
            {$set: 
                {
                    [`logs.$[x].stock`]:piezaEnCatalogo.stock
                }
            },
            {
                arrayFilters: [{"x.title": pieza.plano}]
            })
            responses.push(r)
        }
         await this.client.close()
         return responses

    }
    async updateCatalog(body:{piezas:Pieza[],attr:'cantidadManufactura'|'cantidadDetalle'|"cantidadRechazada",catalogId:string}){
    
        const responses:any[] = []
        const pc = await this.getCollection("catalog")
        const catalog = await this.getCatalog(body.catalogId) as any
        for(let i = 0;i < body.piezas.length;i++){
            const pieza = body.piezas[i]!
            let attr:number[] = []
            if(body.attr != "cantidadRechazada")
                attr = pieza.cantidadRecibida
            else
                attr = pieza.cantidadRechazada
            
            const piezaEnCatalogo = catalog.logs.find((c:any)=>{return c.title == pieza.title}) as Pieza
            piezaEnCatalogo[body.attr].push(attr.at(-1)!)
            if(body.attr != "cantidadRechazada")
                piezaEnCatalogo.stock.push({c:attr.at(-1)!,t:body.attr})
            await this.client.connect();
            const r = await pc.updateOne(
            { _id:new ObjectId(body.catalogId)},
            {$set: 
                {
                    [`logs.$[x].${body.attr}`]:piezaEnCatalogo[body.attr as keyof Pieza]
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

    

    
    async createLog(log:any){
        const c = await this.getCollection("logs")
        const insertResult = await c.insertOne(log);
        await this.client.close()
        return insertResult
    }

    async createAlmacen(body:{piezas:Pieza[],catalogId:string}){
        const item = {
            piezas:body.piezas,
            catalogId:body.catalogId,
            createdAt:moment().endOf("D").toISOString()
        }
         const c = await this.getCollection("almacen")
        const insertResult = await c.insertOne(item);
        await this.client.close()
        return insertResult
    }

    async createPieza(p:Pieza,catalogId:string){
        const total = this.piezasAsNumber(p.piezas)
        const piezas:Pieza[] = []
        p.cantidadRechazada = []
        p.cantidadDetalle = []
        p.cantidadManufactura = []
        p.cantidadAlmacen = []
        p.cantidadRecibida = []
        p.fechaRecibida = []
        p.stock = []
        if(total == 0){
            p.piezas = p.piezas.split("+")[0]!.trim()
            const toPush = structuredClone(p)
            toPush.title = `${toPush.title} (ESPEJO)`
            piezas.push(toPush)
            toPush.isEspejo = true;
        }
        piezas.push(p)
        const pc = await this.getCollection("catalog")
        const catalogo = await pc.findOne({ _id:new ObjectId(catalogId)}) as unknown as Catalogo
        catalogo.logs.push(...piezas)
        const r = await pc.updateOne( 
            { _id:new ObjectId(catalogId)},
            {$set: {[`logs`]:catalogo.logs}}
        )
        return {r,piezas}
        
    }
    async createCatalogo(piezas:Pieza[]){
        const espejos:Pieza[] = []
        let errored = false
        piezas.forEach((p:Pieza)=>{
            try{
                const total = this.piezasAsNumber(p.piezas)
                p.cantidadRechazada = []
                p.cantidadDetalle = []
                p.cantidadManufactura = []
                p.cantidadAlmacen = []
                p.cantidadRecibida = []
                p.stock = []
                if(total == 0){
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
        const c = await this.getCollection("catalog")
        const insertResult = await c.insertOne(catalogo as any);
        await this.client.close()
        return insertResult
    }

    piezasAsNumber(val:string){
        if(/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val)){
        return Number(val)
        }
        return 0
    }
    async createProveedor(proveedor:Proveedor){
        proveedor.active = true
        const c = await this.getCollection("provider")
        const insertResult = await c.insertOne(proveedor as any);
        await this.client.close()
        return insertResult
    }
    

    async get(collection:Collection){
        const c = await this.getCollection(collection)
        const cursor = await c.find()
        const r = await cursor.toArray()
        await this.client.close()
        return r
    }

    async getLogs(logId:string){
        const c = await this.getCollection("logs")
        const r = await c.findOne({ projectId:logId})
        await this.client.close()
        return r
    }
    async getCatalog(logId:string){
        const c = await this.getCollection("catalog")
        const r = await c.findOne({ _id:new ObjectId(logId)})
        await this.client.close()
        return r
    }
    

   

    private async getCollection(c:Collection){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection(c);
        return collection
    }
}