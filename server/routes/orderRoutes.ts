import { Router } from 'express';
import { Mongo } from '../Mongo.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { MongoClient, ObjectId } from 'mongodb';
import { Salida } from '@shared-types/Salida.js';
import moment from 'moment';
import { ip } from '../App.js';
import { createWhat } from '../mongo/ICEMTransactions.js';
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
orderRouter.put("/date",async(req,res)=>{
    const r = await mongo.orders.updateDate(req.body)
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
    const client:MongoClient = await mongo.orders.connectClient()
    try {
        const {todoBien,inCatalog} = await mongo.orders.verificarNoEstaEnUso(req.body.catalogId,req.body.orden.piezas,client)
        if(!todoBien)
            return res.status(200).send({data:{db:inCatalog,sent:req.body.list,todoBien:todoBien}})

        const r = await mongo.orders.createOrdenV2(req.body.orden,req.body.orden.user)
        const o = await mongo.orders.getOrdersV2(req.body.orden.idProject!,client)
        await mongo.projects.updateProjectWithClient({ordenesCount:o.length},"_id",new ObjectId(req.body.orden.idProject),client)
        
        if(req.body.orden.tipo == "Detalle"){
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
                usuario:req.body.orden.user.name,
                catalogId:req.body.orden.catalogId,
                idUsuario:req.body.orden.user._id,
                fechaSalida:moment().endOf("D").toISOString(),
                projectId:req.body.orden.idProject!,
                project:req.body.orden.project!,
                folio:"",
                folioOrden:req.body.orden.folio,
                tipo:"Detalle",
                status:"ABIERTA",
                actualSalidas : []
            }
            const folio = await mongo.orders.getFolioWithClient(client)
            salidas.folio = folio.Almacen
            for(let i = 0 ;i < req.body.orden.piezas.length;i++){
                const pieza = req.body.orden.piezas[i]
                const salida:Salida ={
                    tipo:"Detalle",
                    fechaSalida:moment().endOf("D").toISOString(),
                    pieza:pieza.title,
                    material:pieza.material,
                    acabado:pieza.acabado,
                    folio:folio.Almacen,
                    folioOrden:req.body.orden.folio,
                    piezas:Number(pieza.piezas),
                    idUsuario:req.body.orden.user.name,
                    usuario:req.body.orden.user._id,
                    projectId:req.body.orden.idProject!
                }
                salidas.salidas.push(salida)
            }
            await mongo.salida.createSalidaWithClient(client,salidas)
            await mongo.salida.incrementFolioWithClient("Almacen",client)
            const what = createWhat(req.body.orden.piezas,"piezas")
            const body = {
                piezas:what,
                catalogId:req.body.catalogId,
                razon:"SALIDA Detalle"
            }
            const p = await mongo.updateStockWithClient(body,client)
            
        }   
        await client.close()
        res.status(200).send({ success: true, insert:r,todoBien:todoBien });
    } catch (err) {
        
        console.log(err)
        res.status(500).send({ error: 'Error al crear orden de trabajo', details: err });
    }finally{
        try{ await mongo.orders.getClient().close() }
        catch(e){}
        
    }
});

export default orderRouter;
