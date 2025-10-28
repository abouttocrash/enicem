import { Router } from 'express';
import { Mongo } from '../Mongo.js';

const providerRouter = Router();
const mongo = Mongo.instance

providerRouter.post("/",async(req,res)=>{
    const p = await mongo.createProveedor(req.body)
    res.status(200).send({data:p})
})
providerRouter.get("/",async(req,res)=>{
    const p = await mongo.get("provider")
   
    res.status(200).send({data:p})
})

providerRouter.put("/",async(req,res)=>{
   
    const p = await mongo.provider.editProveedor(req.body)
    res.status(200).send({data:p})
})

export default providerRouter;