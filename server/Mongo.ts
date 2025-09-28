import {MongoClient,ObjectId} from 'mongodb'
import { OrdenTrabajoMongo } from './mongo/OrdenTrabajoMongo.js';
import { BitacoraMongo } from './mongo/BitacoraMongo.js';
import {  Milestone } from '@shared-types/Bitacora.js';
import { ProyectosMongo } from './mongo/ProyectosMongo.js';
import { Catalogo, Pieza } from '@shared-types/Pieza.js';
import { CatalogoMongo } from './mongo/CatalogoMongo.js';
import { UsuarioMongo } from './mongo/UsuarioMongo.js';
import { ProveedorMongo } from './mongo/ProveedorMongo.js';
export type Collection = "logs"|"projects"|"catalog"|"orders"|"users" | "provider" | "folio" | "almacen"
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
        }
        return Mongo.#instance;
    }
    async updateLog(body:any){
        const date = new Date()
        const milestone:Milestone = body.milestone
        milestone.expand = true
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
    async updateCatalog(body:{piezas:Pieza[],attr:'cantidadManufactura'|'cantidadDetalle',catalogId:string}){
    
        const responses:any[] = []
        const pc = await this.getCollection("catalog")
        const catalog = await this.getCatalog(body.catalogId) as any
        for(let i = 0;i < body.piezas.length;i++){
            const pieza = body.piezas[i]!
            const attr = pieza.cantidadRecibida
            
            const piezaEnCatalogo = catalog.logs.find((c:any)=>{return c.title == pieza.title}) as Pieza
            piezaEnCatalogo[body.attr].push(attr.at(-1)!)
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
            createdAt:new Date().toISOString()
        }
         const c = await this.getCollection("almacen")
        const insertResult = await c.insertOne(item);
        await this.client.close()
        return insertResult
    }
    async createCatalogo(piezas:Pieza[]){
        piezas.forEach((p:Pieza)=>{
            const total = this.piezasAsNumber(p.piezas)
            p.indices = []
            p.cantidadRechazada = []
            p.cantidadDetalle = []
            p.cantidadManufactura = []
            p.cantidadAlmacen = []
            p.cantidadRecibida = []
            for(let i = 0;i < total;i++){
               p.indices.push(p.title+"_$_"+i)
            }
        })
        const catalogo:Catalogo = {
            logs:piezas,
            createdAt:new Date().toISOString()
        }
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
    async createProveedor(user:any){
        const u = {
            name:user.name,
            color:"#e76f51"
        }
        const c = await this.getCollection("provider")
        const insertResult = await c.insertOne(u);
        await this.client.close()
        return insertResult
    }
    async createUser(user:any){
        const u = {
            name:user.name,
            color:"#e76f51"
        }
        const c = await this.getCollection("users")
        const insertResult = await c.insertOne(u);
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