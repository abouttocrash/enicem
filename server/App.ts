import express from 'express';
import cors from 'cors'
import path from 'path';
import fs, { mkdirSync } from 'fs'
import apiRouter from './routes/index.js'; 
import { Mongo } from './Mongo.js';
const app = express();
app.use(express.json())
app.use(cors())
app.use('/static',express.static(path.join(process.cwd(), 'imagenes')));
app.use('/static',express.static(path.join(process.cwd(), 'data')));
const port = 3000;
app.use('/', apiRouter);
const mongo = Mongo.instance

app.listen(port, async() => {
    console.log(`Server listening on port ${port}`);
    const dataDir = path.join(process.cwd(), 'data')
    if(!fs.existsSync(dataDir)){
        mkdirSync(dataDir)
    }
});

app.get("/projectData",async(req,res)=>{
    const id = req.query.projectId
    const catalogId = req.query.catalogId
    const proyectos = await mongo.projects.getAll("ABIERTO")
    const orders = await mongo.orders.getOrders(id as string)
    const bitacora = await mongo.logs.getBitacora(id as string)
    const catalogo = await mongo.catalog.getCatalogo(catalogId as string)
    res.status(200).send({data:{
        proyectos,
        ordenes:orders,
        bitacora:bitacora,
        catalogo:catalogo
    }});
})