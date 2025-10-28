import express, { Request, Response } from 'express';
import cors from 'cors'
import path from 'path';
import fs, { mkdirSync } from 'fs'
import apiRouter from './routes/index.js'; 
import { Mongo } from './Mongo.js';
import { Catalogo } from '@shared-types/Pieza.js';
import { Reporter } from './Reporter.js';
import { writePDF } from './PDF_reader/PDF_Writer.js';
import moment from 'moment';
const app = express();
app.use(express.json())
app.use(cors())
app.use('/static',express.static(path.join(process.cwd(), 'imagenes')));
app.use('/static',express.static(path.join(process.cwd(), 'data')));
app.use('/static',express.static(path.join(process.cwd(), 'excel')));
app.use('/static',express.static(path.join(process.cwd(), 'pdf-ordenes')));
const browserDist = path.join(process.cwd(), 'dist/enicem/browser');
export const ip = "http://localhost:3000"
app.use(express.static(browserDist));

// tus rutas API (asegúrate de que apiRouter tenga prefijo correcto)
app.use('/', apiRouter);

app.get(/^((?!\/api).)*$/, (_req: Request, res: Response) => {
    console.log(_req.url)
  res.sendFile(path.join(browserDist, 'index.html'));
});

app.use(/^((?!\/api).)*$/, (_req: Request, res: Response) => {
  res.sendFile(path.join(path.join(process.cwd(),'dist/enicem/browser/index.html')));
});
const port = 3000;
app.use('/', apiRouter);
const mongo = Mongo.instance

app.listen(port, async() => {
    console.log(`Server listening on port ${port}`);
    const dataDir = path.join(process.cwd(), 'data')
    const pdfDir = path.join(process.cwd(), 'pdf-ordenes')
    if(!fs.existsSync(dataDir)){
        mkdirSync(dataDir)
        mkdirSync(pdfDir)
    }
});

app.get("/api/projectData",async(req,res)=>{
    const id = req.query.projectId
    const catalogId = req.query.catalogId
    const proyectos = await mongo.projects.getAll("ABIERTO")
    const orders = await mongo.orders.getOrders(id as string)
    const bitacora = await mongo.logs.getBitacora(id as string)
    const catalogo = await mongo.catalog.getCatalogo(catalogId as string) as unknown as Catalogo
    const salida = await mongo.salida.getSalidas(id as string)
    const rechazos = (await mongo.rechazo.getRechazos()).filter(r=>{return r.active})
    const users = await mongo.user.getUsers()
    const proveedores = await mongo.provider.getProvedores()
    catalogo.logs.forEach(p=>{
        p.asociadas = orders.filter(o=>{
            return o.piezas.find(p2=>{
                return p2.title.includes(p.title)
            })
        }).map(m=>{
            return m.folio
        })
    })
    res.status(200).send({data:{
        proyectos,
        ordenes:orders,
        bitacora:bitacora,
        catalogo:catalogo,
        salidas:salida, 
        userData:users,
        proveedores:proveedores,
        rechazos:rechazos
    }});
})

app.get("/api/report",async(req,res)=>{
    const fechaInicial = req.query.fecha1 as string
    const fechaFinal = req.query.fecha2 as string
    const ordenes = await mongo.orders.getOrdersbyFecha(fechaInicial,fechaFinal)
    const proveedores = await mongo.provider.getProvedores()
    const reporter = new Reporter()
    const buffer = await reporter.build(ordenes,moment(fechaInicial).locale("es").format("DD MMM YYYY"),moment(fechaFinal).locale("es").format("DD MMM YYYY"),proveedores) as any
    const excelPath  = path.join(process.cwd(), 'excel\\');
    fs.readdirSync(excelPath).forEach(file => {fs.unlinkSync(path.join(excelPath, file));});
    const filename = Date.now()
    fs.writeFileSync(`${excelPath}${filename}.xlsx`,buffer)
    res.status(200).send({
        data:{
            path:`${ip}/static/${filename}.xlsx`
        }
    })
})

app.get("/api/report/proveedor",async(req,res)=>{
    const reporter = new Reporter()
    const id = req.query.proveedor as string
    const f1 = req.query.fecha1 as string
    const f2 = req.query.fecha2 as string
    const o = await mongo.orders.getOrdersbyProveedor(id,f1,f2)
    const proveedores = await mongo.provider.getProvedores()
    const proyectos = await mongo.projects.getAllNoFilter()
    const buffer = await reporter.buildByProveedor(
        o,
        moment(f1).locale("es").format("DD MMM YYYY"),
        moment(f2).locale("es").format("DD MMM YYYY"),
        proveedores,
        proyectos,
        id
    ) as any
    const excelPath  = path.join(process.cwd(), 'excel\\');
    fs.writeFileSync(`${excelPath}proveedor_${id}.xlsx`,buffer)
    console.log(`${ip}/static/proveedor_${id}.xlsx`)
    res.status(200).send({
        data:{
            path:`${ip}/static/proveedor_${id}.xlsx`
        }
    })
})

app.post("/api/pdf/orden",async(req,res)=>{
    req.body.orden.dateEntrega = moment(req.body.orden.dateEntrega).locale("es").format("DD MMMM YYYY")
    const r = writePDF(req.body.orden)
    res.status(200).send({
        data:{
            path:`${ip}/static/${r}`
        }
    })
})
app.post("/api/pdf/salida",async(req,res)=>{
    let orden:any
    if(req.body.salida.tipo == "Detalle"){
        orden = await mongo.orders.getOrdenDetalleByFolio(req.body.salida.folioOrden)
       
    }
    else{
        const salida = req.body.salida as any
        const piezas:any[] = []
        let total = 0 
        salida.salidas.forEach((s:any)=>{
            total += s.piezas
           piezas.push({
                title:s.pieza,
                acabado:s.acabado || "-",
                material:s.material || "-",
                piezas:s.piezas

            })
        })
        orden = {
            project:salida.project,
            folio:salida.folio,
            proveedor:"-",
            _id:salida._id,
            piezas:piezas,
            totalPiezas:total
        }
    }
     const r = writePDF(orden!)
        res.status(200).send({
            data:{
                path:`${ip}/static/${r}`
            }
        })
    
})