import { Router } from 'express';
import { Mongo } from '../Mongo.js';
import multer from 'multer';
import { PDF } from '../PDF_reader/PDF.js';
import path from 'path';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Puedes personalizar la carpeta destino aquí
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, cb) {
        // Usa el nombre original del archivo
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
        const p = await mongo.createCatalogo(pdfs)
        pdf.emptyUploads(req.body.projectId)
        res.status(200).send({data:true,log:p})
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
        res.status(200).send({data:true,p:p})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
});
catalogRouter.post('/almacen', async(req, res) => {
    try{
        const p = await mongo.createAlmacen(req.body)
        const resp = await mongo.catalog.updateCatalog(req.body)
        res.status(200).send({data:true,inserted:{p,resp}})
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
});

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




export default catalogRouter;