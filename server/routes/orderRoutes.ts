import { Router } from 'express';
import { Mongo } from '../Mongo.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { ObjectId } from 'mongodb';
const orderRouter = Router();
const mongo = Mongo.instance
const upload = multer({ dest: 'uploads/' });

orderRouter.get("/",async(req,res)=>{
    const p = await mongo.orders.getOrden(req.query.orderId as string)
    res.status(200).send({data:p})
})
orderRouter.put("/",async(req,res)=>{
    await mongo.orders.updateOrden(req.body.orden,req.body.status)
    res.status(200).send({data:{}})
})
orderRouter.put("/status",async(req,res)=>{
    await mongo.orders.updateStatus(req.body)
    res.status(200).send({data:{}})
})
orderRouter.get("/folio",async(req,res)=>{
    const p = await mongo.orders.getFolio()
    console.log(p)
    res.status(200).send({data:p})
})

orderRouter.get("/all",async(req,res)=>{
    const p = await mongo.orders.getOrders(req.query.projectId as string)
    res.status(200).send({data:p})
})

orderRouter.post('/', async (req, res) => {
    try {
        //let {files,piezas } = setImages(req.files as Express.Multer.File[],req.body.piezas)
        const obj = await mongo.orders.createOrden(req.body)
        //saveImages(files,req.body.idProject,obj)
        const o = await mongo.orders.getOrders(req.body.idProject!)
        await mongo.projects.updateProject({ordenesCount:o.length},"_id",new ObjectId(req.body.idProject))
        res.status(200).send({ success: true, insert:obj });
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: 'Error al guardar imágenes', details: err });
    }
});

function setImages(files:Express.Multer.File[],p:any[]){
    let piezas:any[] = []
    p.forEach((pieza:any)=>{
        const ob = JSON.parse(pieza)
        const filenames = files.map(f=>{return f.originalname}).filter(f=>{
            return f.includes(ob.title)})!
        piezas.push({piezas:ob.piezas,title:ob.title,imgs:filenames})
    })
    return {files,piezas}
}

function saveImages(files:Express.Multer.File[],idProject:string,obj:any){
    const projectDir = path.join(process.cwd(), 'imagenes', `${idProject}/${obj.id}`);
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }
        
    files.forEach(file => {
        let ext = '';
        switch (file.mimetype) {
            case 'image/jpeg':
                ext = '.jpg';
                break;
            case 'image/png':
                ext = '.png';
                break;
            case 'image/gif':
                ext = '.gif';
                break;
            
        }
        const baseName = path.parse(file.originalname).name;
        const destPath = path.join(projectDir, baseName + ext);
        fs.renameSync(file.path, destPath);
    });
}

// app.get("/order",async(req,res)=>{
//     const p = await mongo.getOrder(req.query.orderId as string)
//     p!.img = []
//     const projectDir = path.join(process.cwd(), 'imagenes', `${p!.projectId}/${p!.id}`);
//     fs.readdirSync(projectDir).forEach(f=>{
//         p!.img.push(`http://localhost:3000/static/${p!.projectId}/${p!.id}/${f}`)
//     })
//     res.status(200).send({data:p})
// })


export default orderRouter;
