import { Router } from 'express';
import { Mongo } from '../Mongo.js';
import { ObjectId } from 'mongodb';
import { Status } from '../mongo/ProyectosMongo.js';
const projectRouter = Router();
const mongo = Mongo.instance

projectRouter.get("/all",async(req,res)=>{
    const status = req.query.status as Status
    const p = await mongo.projects.getAll(status)
    res.status(200).send({data:p})
})

projectRouter.post("/",async(req,res)=>{
    const r = await mongo.projects.createProject(req.body.proyecto,req.body.creador)
    await mongo.logs.createBitacora(r.insertedId,req.body.creador._id)
    res.status(200).send({data:r});
})

projectRouter.put("/",async(req,res)=>{
     const updateObject = { 
        catalogId: req.body.catalogId,
        createdLogId: req.body.userId,
        piezasCount:req.body.count
    }
    const p = await mongo.projects.updateProject(updateObject, "_id",new ObjectId(req.body.projectId))
    res.status(200).send({data:p})
})
projectRouter.put("/edit",async(req,res)=>{
    try{
        const p = await mongo.projects.updateProject(req.body.pData, "_id",new ObjectId(req.body.projectId))
        res.status(200).send({data:true})
    }
    catch(e){
        res.status(500).send({data:false})
    }
})
projectRouter.put("/cancel",async(req,res)=>{
    try{
        const p = await mongo.projects.updateProject(req.body.pData, "_id",new ObjectId(req.body.projectId))
        const o = await mongo.orders.getOrders(req.body.projectId)
        for(let i = 0;i < o.length;i++){
            if(o[i]?.status == "ABIERTA"){
                await mongo.orders.updateStatus({status:"CANCELADA",id:o[i]?._id!})
            }
        }
        res.status(200).send({data:true})
    }
    catch(e){
        res.status(500).send({data:false})
    }
})

projectRouter.put("/status",async(req,res)=>{
    let p :any
    if(req.body.status == "ELIMINADO")
        p = await mongo.projects.deleteProject(req.body.projectId)

    else
        p = await mongo.projects.updateProject({status:req.body.status},"_id",new ObjectId(req.body.projectId))
    res.status(200).send({data:p})
})

export default projectRouter;