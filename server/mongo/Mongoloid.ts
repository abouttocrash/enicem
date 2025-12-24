import { Mongo, type Collection } from "../Mongo.js";
import {MongoClient,ObjectId} from 'mongodb'
export class Mongoloid{
    protected client:MongoClient
    private collection:Collection
    private dbName = 'icem';
    mongo = Mongo.instance
    private folioObject = new ObjectId("000000000000000000000000")
    constructor(collection:Collection,client:MongoClient){
        this.client = client
        this.collection = collection
    }

    getClient(){
        return this.client
    }
    async connectClient(){
        await this.client.connect()
        return this.client
    }

    async incrementFolio(attribute:string){
        const folio = await this.getFolio()
        folio[attribute] = folio[attribute] +1
        await this.updateOne(folio,"Folio",this.folioObject,"folio")
    }
    async incrementFolioWithClient(attribute:string,client:MongoClient){
        const folio = await this.getOneWithClient(client,"Folio",this.folioObject,"folio")!
        folio![attribute] = folio![attribute] +1
        await this.updateOneWithClient(client,folio,"Folio",this.folioObject,"folio")
    }

    async getFolio(){
        const folio = await this.getOne("Folio",this.folioObject,"folio")
        return folio!
    }

    async getFolioWithClient(client:MongoClient){
        const folio = await this.getOneWithClient(client,"Folio",this.folioObject,"folio")!
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
    protected async getManyWithClient<T>(by:string,id:string,client:MongoClient){
        const obj = {[by]:id}
        const c = await this.getCollectionWithClient(this.collection,client)
        const cursor = await c.find(obj)
        const r = await cursor.toArray()
        return r as T[]
    }
    protected async getManyObj<T>(obj:any){
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
    protected async getOneWithClient(client:MongoClient,by:string,id:string | ObjectId,collection = this.collection){
        const obj = {[by]:id}
        const c = await this.getCollectionWithClient(collection,client)
        const r = await c.findOne(obj)
        return r 
    }
    
    protected async create(obj:any){
        const c = await this.getCollection(this.collection)
        const insertResult = await c.insertOne(obj);
        return insertResult
    }

    protected async createDataWithClient(client:MongoClient,obj:any){
        const c = await this.getCollectionWithClient(this.collection,client)
        const insertResult = await c.insertOne(obj)
        return insertResult
    }
    
    
    protected async getCollection(c:Collection){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection(c);
        return collection
    }
    protected async getCollectionWithClient(c:Collection,client:MongoClient){
        const db = client.db(this.dbName);
        const collection = db.collection(c);
        return collection
    }

    protected async getAllItems<T>(col:Collection):Promise<T[]>{
        const c = await this.getCollection(col)
        const cursor = await c.find()
        const r = await cursor.toArray()
        return r as T[]
    }
    protected async getAllItemsWithClient<T>(col:Collection,client:MongoClient):Promise<T[]>{
        const c = await this.getCollectionWithClient(col,client)
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
    protected async updateOneWithClient(client:MongoClient,obj:any,by:string,id:string|ObjectId,collection = this.collection){
        const byObj = {[by]:id}
        const pc = await this.getCollectionWithClient(collection,client)
        const r = await pc.updateOne(byObj,{ $set:obj})
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