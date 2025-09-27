import { Router } from 'express';
import { Mongo } from '../Mongo.js';
const logRouter = Router();
const mongo = Mongo.instance
//logs
logRouter.post('/', async(req, res) => {
    const p = await mongo.createLog(req.body)
    res.status(200).send({data:p})
});

logRouter.put("/",async(req,res)=>{
    const p = await mongo.updateLog(req.body)
    res.status(200).send({data:p})
})

logRouter.get("/",async(req,res)=>{
    const p = await mongo.getLogs(req.query.projectId as string) as any
    const users = await mongo.get("users")
    p.milestones.forEach((m:any)=>{
       const u = users.find((u)=>{return u._id.toString() == m.createdBy}) as any
       m.usuario = u.name
    })
    
    res.status(200).send({data:p})
})




export default logRouter;