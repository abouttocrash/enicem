import { Router } from 'express';
import { Mongo } from '../Mongo.js';

const userRouter = Router();
const mongo = Mongo.instance

userRouter.post("/",async(req,res)=>{
    const p = await mongo.user.createUser(req.body)
    res.status(200).send({data:p})
})
userRouter.put("/",async(req,res)=>{
   
    const p = await mongo.user.editUser(req.body)
    res.status(200).send({data:p})
})
userRouter.get("/",async(req,res)=>{
    console.log(req.query.a)
    const p = await mongo.user.getUsers()
    if(req.query.a == "false"){
        p.p = p.p.filter(u=>{return u.name != "ADMIN"})
    }
    res.status(200).send({data:p})
})

export default userRouter;