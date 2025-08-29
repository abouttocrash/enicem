import {MongoClient,ObjectId} from 'mongodb'
export class Mongo{
    private url = 'mongodb://localhost:27017';
    private dbName = 'icem';
    private client!:MongoClient
    constructor(){
        this.client =  new MongoClient(this.url);
    }
    async main() {
        
        console.log('Connected successfully to MONGO server');
        const db = this.client.db(this.dbName);
        const collection = db.collection('users');
    }
    async updateProject(ids:any){
        console.log(ids.projectId)
        const pc = await this.getCollection("projects")
        const r = await pc.updateOne(
        { id: ids.projectId as any},
        { 
            $set: { logId: ids.logId, createdLogId: ids.userId,status:"Bitácora",count:ids.count },
            $currentDate: { lastModified: true }
        })
        await this.client.close()
        return r
    }
    async createProject(project:any){
        project.id = crypto.randomUUID()
        project.createdAt = new Date()
        const c = await this.getCollection("projects")
        const insertResult = await c.insertOne(project);
        await this.client.close()
        const r = {insertedId:project.id,createdAt:project.createdAt}
        return r
    }

    async createOrden(piezas:any[],projectId:string){
        const obj = {
            piezas:piezas,
            id:crypto.randomUUID(),
            projectId:projectId,
            createdAt: new Date()
        }
        const c = await this.getCollection("orders")
        const insertResult = await c.insertOne(obj);
        await this.client.close()
        return obj;
    }
    async createLog(logs:any){
        logs.forEach((l:any)=>{
            l.registrado = -1
            l.faltantes = -1
            l.rechazadas = -1
            l.rechazo = ""
            l.comentarios = []
        })
        const log = {
            logs:logs,
            createdAt:new Date()
        }
        const c = await this.getCollection("logs")
        const insertResult = await c.insertOne(log);
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

    async get(collection:string){
        const c = await this.getCollection(collection)
        const cursor = await c.find()
        const r = await cursor.toArray()
        await this.client.close()
        return r
    }

    async getLog(logId:string){
        const c = await this.getCollection("logs")
        const r = await c.findOne({ _id:new ObjectId(logId)})
        await this.client.close()
        return r
    }
    async getOrders(projectId:string){
        const c = await this.getCollection("orders")
        const cursor = await c.find({ projectId:projectId})
        const r = await cursor.toArray()
        await this.client.close()
        return r
    }
    async getOrder(id:string){
        const c = await this.getCollection("orders")
        const r = await c.findOne({ _id:new ObjectId(id)})
        await this.client.close()
        return r
    }
   

    private async getCollection(c:string){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection(c);
        return collection
    }
}