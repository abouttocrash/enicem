import { Mongo, type Collection } from "../Mongo.js";
import {MongoClient,ObjectId} from 'mongodb'
export class Mongoloid{
    protected client:MongoClient
    private collection:Collection
    private dbName = 'icem';
    mongo = Mongo.instance
    constructor(collection:Collection,client:MongoClient){
        this.client = client
        this.collection = collection
    }

    async incrementFolio(attribute:string){
        const folio = await this.getFolio()
        folio[attribute] = folio[attribute] +1
        await this.updateOne(folio,"Folio",new ObjectId("000000000000000000000000"),"folio")
    }

    async getFolio(){
        const folio = await this.getOne("Folio",new ObjectId("000000000000000000000000"),"folio")
        return folio!
    }

    
    protected async getMany<T>(by:string,id:string){
        const obj = {[by]:id}
        const c = await this.getCollection(this.collection)
        const cursor = await c.find(obj)
        const r = await cursor.toArray()
        await this.client.close()
        return r as T[]
    }
    
    protected async getOne(by:string,id:string | ObjectId,collection = this.collection){
        const obj = {[by]:id}
        const c = await this.getCollection(collection)
        const r = await c.findOne(obj)
        await this.client.close()
        return r 
    }
    
    protected async create(obj:any){
        const c = await this.getCollection(this.collection)
        const insertResult = await c.insertOne(obj);
        return insertResult
    }
    
    
    protected async getCollection(c:Collection){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection(c);
        return collection
    }

    protected async getAllItems<T>(col:Collection):Promise<T[]>{
        const c = await this.getCollection(col)
        const cursor = await c.find()
        const r = await cursor.toArray()
        return r as T[]
    }


    /**
     * 
     * @param obj es el $set
     * @param by 
     * @param id 
     * @param collection 
     * @returns 
     */
    protected async updateOne(obj:any,by:string,id:string|ObjectId,collection = this.collection){
        const byObj = {[by]:id}
        const pc = await this.getCollection(collection)
        const r = await pc.updateOne(byObj,{ $set:obj})
        await this.client.close()
        return r
    
    }

    protected async pushToArray(by:string,id:string, arrName:string, body:any){
        const arrObj = {[arrName]:body}
        const obj = {[by]:new ObjectId(id)}
        const pc = await this.getCollection(this.collection)
        const r = await pc.updateOne(obj,{ $push: arrObj })
        await this.client.close()
        return r
    }
}