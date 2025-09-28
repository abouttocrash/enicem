import { Router } from 'express';
import { Mongo } from '../Mongo.js';

const userRouter = Router();
const mongo = Mongo.instance

userRouter.post("/",async(req,res)=>{
    const p = await mongo.createUser(req.body)
    res.status(200).send({data:p})
})
userRouter.get("/",async(req,res)=>{
    const p = await mongo.user.getUsers()
    res.status(200).send({data:p})
})

export default userRouter;