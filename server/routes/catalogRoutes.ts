import { Router } from 'express';
import { Mongo } from '../Mongo.js';
import multer from 'multer';
import { PDF } from '../PDF_reader/PDF.js';
import path from 'path';
import fs from 'fs';
import { Salida } from '@shared-types/Salida.js';
import moment from 'moment';
import { Reporter } from '../Reporter.js';
import { Catalogo } from '@shared-types/Pieza.js';
import { ip } from '../App.js';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });
const catalogRouter = Router();
const mongo = Mongo.instance
const pdf = new PDF();
//catalog
catalogRouter.post('/', upload.array('files'), async(req, res) => {
    try{
        const pdfs = await pdf.readFolder()
        if(pdfs.length == 0) {
            pdf.emptyUploads(req.body.projectId,false)
            return res.status(400).send({error:"Error al leer un PDF."})
        }

        const p = await mongo.createCatalogo(pdfs)
        if(p == false){
             pdf.emptyUploads(req.body.projectId,false)
            return res.status(400).send({error:"Error al obtener info de un PDF"})
        }
        pdf.emptyUploads(req.body.projectId)
        res.status(200).send({data:p})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
});
catalogRouter.post('/plano', upload.array('files'), async(req, res) => {
    try{
        const pdfs = await pdf.readFolder()
        pdf.emptyUploads(req.body.projectId)
        const p = await mongo.createPieza(pdfs[0]!,req.body.catalogId)
        res.status(200).send({data:p.piezas})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
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
    const reporter = new Reporter()
    const p = await mongo.catalog.getCatalogo(req.query.catalogId as string) as unknown as Catalogo
    const buffer = await reporter.buildCatalogo(p,{name:req.query.project as string,noSerie:req.query.clave as string}) as any
    const excelPath  = path.join(process.cwd(), 'excel\\');
   // fs.readdirSync(excelPath).forEach(file => {fs.unlinkSync(path.join(excelPath, file));});
    fs.writeFileSync(`${excelPath}bitacora_${req.query.project}_${req.query.clave}.xlsx`,buffer)
    
    res.status(200).send({
        data:{
            path:`${ip}/static/bitacora_${req.query.project}_${req.query.clave}.xlsx`
        }
    })
})





export default catalogRouter;