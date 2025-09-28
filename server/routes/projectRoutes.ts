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

projectRouter.put("/status",async(req,res)=>{
    const p = await mongo.projects.updateProject({status:req.body.status},"_id",new ObjectId(req.body.projectId))
    res.status(200).send({data:p})
})

export default projectRouter;