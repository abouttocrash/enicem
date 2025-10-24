import { Router } from 'express';
import { Mongo } from '../Mongo.js';
// /rechazo
const rechazoRouter = Router();
const mongo = Mongo.instance

rechazoRouter.post("/",async(req,res)=>{
    const p = await mongo.rechazo.createRechazo(req.body)
    res.status(200).send({data:p})
})
rechazoRouter.get("/",async(req,res)=>{
    const p = await mongo.rechazo.getRechazos()
    res.status(200).send({data:p})
})

rechazoRouter.put("/",async(req,res)=>{
    const p = await mongo.rechazo.editRechazo(req.body)
    res.status(200).send({data:p})
})


export default rechazoRouter;