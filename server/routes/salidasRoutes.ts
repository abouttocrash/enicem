import { Router } from 'express';
import { Mongo } from '../Mongo.js';

const salidaRouter = Router();
const mongo = Mongo.instance

salidaRouter.post("/",async(req,res)=>{
    const p = await mongo.salida.createSalida(req.body)
    res.status(200).send({data:p})
})
salidaRouter.get("/",async(req,res)=>{
    const p = await mongo.salida.getSalidas(req.query.projectId as string)
    res.status(200).send({data:p})
})
salidaRouter.get("/outview",async(req,res)=>{
    const p = await mongo.salida.getAllSalidas(req.query)
    res.status(200).send({data:p})
})
salidaRouter.put("/outview",async(req,res)=>{
    const p = await mongo.salida.updateSalida(req.body.salida)
    res.status(200).send({data:p})
})
salidaRouter.put("/outview/cantidad",async(req,res)=>{
    const p = await mongo.salida.updateSalidaCantidad(req.body.salida)
    res.status(200).send({data:p})
})

export default salidaRouter;