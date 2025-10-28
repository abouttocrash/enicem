import { Router } from 'express';
import { Mongo } from '../Mongo.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { ObjectId } from 'mongodb';
import { Salida } from '@shared-types/Salida.js';
import moment from 'moment';
import { Pieza } from '@shared-types/Pieza.js';
import { ip } from '../App.js';
const orderRouter = Router();
const mongo = Mongo.instance
const upload = multer({ dest: 'uploads/' });

orderRouter.get("/",async(req,res)=>{
    const p = await mongo.orders.getOrden(req.query.orderId as string)
    res.status(200).send({data:p})
})
orderRouter.put("/",async(req,res)=>{
    const r = await mongo.orders.updateOrden(req.body.orden,req.body.status)
    res.status(200).send({data:r})
})
orderRouter.put("/status",async(req,res)=>{
    await mongo.orders.updateStatus(req.body)
    res.status(200).send({data:{}})
})
orderRouter.get("/folio",async(req,res)=>{
    const p = await mongo.orders.getFolio()
    res.status(200).send({data:p})
})
orderRouter.post("/verify",async(req,res)=>{
    const p = await mongo.catalog.getCatalogo(req.body.id)
    const inCatalog:Pieza[] = []
    req.body.list.forEach((pi:Pieza)=>{
        inCatalog.push(p!.logs.find((db:Pieza)=>{return db.title == pi.title}))
    })
    const body = req.body.list as Pieza[]
    let todoBien = true;
    inCatalog.forEach((pieza:Pieza)=>{
        const sentPieza = body.find(p=>{return p.title == pieza.title })!
        console.log(
    //     JSON.stringify(sentPieza.cantidadManufactura) , JSON.stringify(pieza.cantidadManufactura),"&&",
            //  JSON.stringify(sentPieza.cantidadDetalle) , JSON.stringify(pieza.cantidadDetalle),"&&",
            //  JSON.stringify(sentPieza.cantidadRecibida) ,JSON.stringify(pieza.cantidadRecibida) ,"&&",
            //  JSON.stringify(sentPieza.cantidadAlmacen) , JSON.stringify(pieza.cantidadAlmacen) ,"&&",
            // JSON.stringify(sentPieza.stock) ,"==", JSON.stringify(pieza.stock) 
        )
        if( JSON.stringify(sentPieza.cantidadManufactura) == JSON.stringify(pieza.cantidadManufactura)&&
             JSON.stringify(sentPieza.cantidadDetalle) == JSON.stringify(pieza.cantidadDetalle) &&
             JSON.stringify(sentPieza.cantidadRecibida) == JSON.stringify(pieza.cantidadRecibida) &&
             JSON.stringify(sentPieza.cantidadAlmacen) == JSON.stringify(pieza.cantidadAlmacen) &&
            JSON.stringify(sentPieza.stock) == JSON.stringify(pieza.stock)
        )
            todoBien = true
        else{
            todoBien = false
            return
        }
    })
    
    res.status(200).send({data:{db:inCatalog,sent:req.body.list,todoBien:todoBien}})
})

orderRouter.get("/all",async(req,res)=>{
    const p = await mongo.orders.getOrders(req.query.projectId as string)
    res.status(200).send({data:p})
})
orderRouter.get("/ordersview",async(req,res)=>{
    const p = await mongo.orders.getOrdersView(req.query)
    res.status(200).send({data:p})
})

orderRouter.get("/images",async(req,res)=>{
    const {projectId, ordenId } = req.query
    let images:Array<string> = []
    const projectDir = path.join(process.cwd(), 'imagenes', `${projectId}/${ordenId}`);
    if(fs.existsSync(projectDir))
        fs.readdirSync(projectDir).forEach(f=>{
            images.push(`${ip}/static/${projectId}/${ordenId}/${f}`)
        })
    res.status(200).send({data:images})
})

orderRouter.post("/images", upload.array('imagenes'), async (req, res) => {
    try {
        const {projectId, ordenId } = req.body
        if (!projectId || !ordenId) {
            return res.status(400).send({ error: 'projectId and orderId are required' });
        }

        const files = req.files as Express.Multer.File[];
        const projectDir = path.join(process.cwd(), 'imagenes', `${projectId}/${ordenId}`);
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
                default:
                    ext = path.extname(file.originalname) || '';
            }
            const baseName = path.parse(file.originalname).name;
            const destPath = path.join(projectDir, baseName + ext);
            fs.renameSync(file.path, destPath);
        });

        res.status(200).send({ success: true, saved: files.length });
    } catch (err) {
        res.status(500).send({ error: 'Error al guardar imágenes', details: err });
    }
});

orderRouter.post('/', async (req, res) => {
    try {
        const obj = await mongo.orders.createOrden(req.body)
        const o = await mongo.orders.getOrders(req.body.idProject!)
        await mongo.projects.updateProject({ordenesCount:o.length},"_id",new ObjectId(req.body.idProject))
        
        if(req.body.tipo == "Detalle"){
            let salidas:{
                salidas:Array<Salida>,
                idUsuario:string,
                usuario:string,
                fechaSalida:string,
                projectId:string,
                catalogId:string,
                project:string,
                folio:string,
                folioOrden:string
                tipo:string,
                status:string,
                actualSalidas:Array<number>
            } = {
                salidas:[],
                usuario:req.body.user.name,
                catalogId:req.body.catalogId,
                idUsuario:req.body.user._id,
                fechaSalida:moment().endOf("D").toISOString(),
                projectId:req.body.idProject!,
                project:req.body.project!,
                folio:"",
                folioOrden:req.body.folio,
                tipo:"Detalle",
                status:"ABIERTA",
                actualSalidas : []
            }
            const folio = await mongo.orders.getFolio()
            salidas.folio = folio.Almacen
            for(let i = 0 ;i < req.body.piezas.length;i++){
                const pieza = req.body.piezas[i]
                const salida:Salida ={
                    tipo:"Detalle",
                    fechaSalida:moment().endOf("D").toISOString(),
                    pieza:pieza.title,
                    material:pieza.material,
                    acabado:pieza.acabado,
                    folio:folio.Almacen,
                    folioOrden:req.body.folio,
                    piezas:Number(pieza.piezas),
                    idUsuario:req.body.user.name,
                    usuario:req.body.user._id,
                    projectId:req.body.idProject!
                }
                salidas.salidas.push(salida)
            }
            await mongo.salida.createSalida(salidas)
            await mongo.salida.incrementFolio("Almacen")
            
            
        }   
        res.status(200).send({ success: true, insert:obj });
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: 'Error al guardar imágenes', details: err });
    }
});






export default orderRouter;
