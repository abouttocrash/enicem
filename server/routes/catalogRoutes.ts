import { NextFunction, Request, Response, Router } from 'express';
import { Mongo } from '../Mongo.js';
import multer from 'multer';
import { PDF } from '../PDF_reader/PDF.js';
import path from 'path';
import fs, { mkdirSync } from 'fs';
import { Salida } from '@shared-types/Salida.js';
import moment from 'moment';
import { Reporter } from '../Reporter.js';
import { Catalogo } from '@shared-types/Pieza.js';
import { ip, UPLOADS_PATH } from '../App.js';
import { actualizarBitacora, crearBitacora } from '../mongo/ICEMTransactions.js';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const p = `${UPLOADS_PATH}/${req.body.projectId}`
        if(!fs.existsSync(p)) mkdirSync(p)
        cb(null, path.join(process.cwd(), 'uploads/'+req.body.projectId+"/"));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });
const catalogRouter = Router();
const mongo = Mongo.instance
const pdf = new PDF();

catalogRouter.delete('/clear', async(req, res) => {
    try{
        const p = `${UPLOADS_PATH}/${req.query.projectId}`
        let exists = fs.existsSync(p)
        console.log(`DELETE /clear ${p} ${exists} `)
        if(fs.existsSync(p)){
            pdf.emptyUploads(req.query.projectId as string,false)
            console.log("DELETED")
        }
        res.status(200).send({data:true})
    }catch(e){
        console.log(e)
        res.status(500).send({error:e})
    }
});


catalogRouter.post("/verify",upload.array('files'), async(req, res) => {
    try{
        const pdfs = await pdf.readFolder(req.body.projectId)
        if(pdfs.length == 0) {
            pdf.emptyUploads(req.body.projectId,false)
            return res.status(400).send({error:"Error al leer un PDF."})
        }
        return res.status(200).send({data:pdfs})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
});
//catalog
catalogRouter.post('/', async(req, res) => {
    try{
        const response = await crearBitacora(req.body.projectId,req.body.userId,req.body.milestone)
        pdf.emptyUploads(req.body.projectId)
        res.status(200).send({data:response})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
});
catalogRouter.post('/add', async(req, res) => {
    try{
        const response = await actualizarBitacora(req.body.projectId,req.body.catalogId,req.body.milestone,req.body.userId)
        pdf.emptyUploads(req.body.projectId)
        res.status(200).send({data:response})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
});
catalogRouter.post('/plano', upload.array('files'), async(req, res) => {
    try{
        const pdfs = await pdf.readFolder(req.body.projectId)
        pdf.emptyUploads(req.body.projectId)
        const p = await mongo.createPieza(pdfs[0]!,req.body.catalogId)
        res.status(200).send({data:p.piezas})
    }catch(e){
        console.log(e)
        res.status(500).send({error:e})
    }
});
catalogRouter.delete('/plano', async(req, res) => {
    try{
        console.log(`DELETE /catalog/plano ${req.query.plano} `)
        const catalogo = await mongo.catalog.getCatalogo(req.query.catalogId as string) as Catalogo
        const index = catalogo.logs.map(p=>{return p.title}).indexOf(req.query.plano as string)
        catalogo.logs.splice(index,1)
        const r = await mongo.catalog.deletePieza(req.query.catalogId as string,catalogo.logs)
        res.status(200).send({data:r})
    }catch(e){
        console.log(e)
        res.status(500).send({error:e})
    }
});

catalogRouter.post('/almacen', async(req, res) => {
    try{
        const p = await mongo.createAlmacen(req.body)
        const resp = await mongo.catalog.updateCatalog(req.body)
        const folio = await mongo.orders.getFolio()
        const prevFolio = folio.Almacen
         let salidas:{
            salidas:Array<Salida>,
            idUsuario:string,
            catalogId:string,
            usuario:string,
            project:string
            fechaSalida:string,
            projectId:string,
            folio:string,
            folioOrden:string
            tipo:string,
            status:string,
            actualSalidas:Array<number>
        } = {
            salidas:[],
            usuario:req.body.user.name,
            idUsuario:req.body.user._id,
            catalogId:req.body.catalogId,
            fechaSalida:moment().endOf("D").toISOString(),
            projectId:req.body.idProject!,
            project:req.body.project,
            folio:folio.Almacen,
            folioOrden:req.body.folio,
            tipo:req.body.tipo,
            status:"ABIERTA",
            actualSalidas: []
        }
        for(let i = 0 ;i < req.body.piezas.length;i++){
            const pieza = req.body.piezas[i]
            const salida:Salida ={
                material:pieza.material,
                acabado:pieza.acabado,
                tipo:req.body.tipo,
                fechaSalida:new Date().toISOString(),
                pieza:pieza.title,
                folio:folio.Almacen,
                folioOrden:"-",
                piezas:Number(pieza.cantidadInDialog),
                idUsuario:req.body.user.name,
                usuario:req.body.user._id,
                projectId:req.body.idProject!
            }
            salidas.salidas.push(salida)
        }
        await mongo.salida.createSalida(salidas)
        await mongo.salida.incrementFolio("Almacen")
        res.status(200).send({data:true,inserted:{p,resp,prevFolio}})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
});

catalogRouter.put("/stock",async(req,res)=>{
    const p = await mongo.updateStock(req.body)
    res.status(200).send({data:p})
})
catalogRouter.put("/",async(req,res)=>{
    const p = await mongo.updateCatalog(req.body)
    res.status(200).send({data:p})
})

catalogRouter.get("/",async(req,res)=>{
    if(req.query.catalogId == "undefined")
        return res.status(200).send({data:{logs:[]}})
    
    const p = await mongo.catalog.getCatalogo(req.query.catalogId as string)
    res.status(200).send({data:p})
})
catalogRouter.get("/reporte",async(req,res)=>{
    try{
        const reporter = new Reporter()
        const p = await mongo.catalog.getCatalogo(req.query.catalogId as string) as unknown as Catalogo
        const buffer = await reporter.buildCatalogo(p,{name:req.query.project as string,noSerie:req.query.clave as string}) as any
        const excelPath  = path.join(process.cwd(), 'excel\\');
        fs.writeFileSync(`${excelPath}bitacora_${req.query.projectId}.xlsx`,buffer)
        res.status(200).send({
        data:{
            path:`${ip}/static/bitacora_${req.query.projectId}.xlsx`
        }
    })
    }catch(e){
        console.log(e)
    }
    
})





export default catalogRouter;