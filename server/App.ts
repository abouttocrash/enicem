import express from 'express';
import cors from 'cors'
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { PDF } from './PDF_reader/PDF.js';
import { Mongo } from './Mongo.js';

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(express.json())
app.use(cors())
console.log(path.join(process.cwd(), 'imagenes'))
app.use('/static',express.static(path.join(process.cwd(), 'imagenes')));
const port = 3000;
const pdf = new PDF();
const mongo = new Mongo()
app.get('/', (req, res) => {
    res.send('Hello from Express with TypeScript!');
});
//C:\Users\luisj\Documents\GitHub\enicem\server\imagenes\68ad1f1e3d19aaf1fb892f59\8ff01bb1-f8cd-4af3-bfb5-b2d011e2f3d7\CXUPT 00010823-038-JIMO_0.png
app.get('/pdf', async(req, res) => {
    const pdfs = await pdf.readFolder('C:\\Users\\luisj\\Desktop\\icem\\DISEÑO MECANICO\\')
    res.status(200).send({data:pdfs})
});
app.post('/log', upload.array('files'), async(req, res) => {
    const pdfs = await pdf.readFolder()
    const p = await mongo.createLog(pdfs)
    pdf.emptyUploads()
    res.status(200).send({data:true,log:p})
});

app.post("/createProject",async(req,res)=>{
    const p = await mongo.createProject(req.body)
    res.status(200).send({data:p})
})
app.put("/updateProject",async(req,res)=>{
    const p = await mongo.updateProject(req.body)
    res.status(200).send({data:p})
})

app.post("/createUser",async(req,res)=>{
    const p = await mongo.createUser(req.body)
    res.status(200).send({data:p})
})
app.get("/users",async(req,res)=>{
    const p = await mongo.get("users")
    res.status(200).send({data:p})
})
app.get("/projects",async(req,res)=>{
    const p = await mongo.get("projects")
    res.status(200).send({data:p})
})
app.get("/log",async(req,res)=>{
    const p = await mongo.getLog(req.query.logId as string)
    res.status(200).send({data:p})
})
app.get("/orders",async(req,res)=>{
    const p = await mongo.getOrders(req.query.projectId as string)
    res.status(200).send({data:p})
})
app.get("/order",async(req,res)=>{
    const p = await mongo.getOrder(req.query.orderId as string)
    p!.img = []
    const projectDir = path.join(process.cwd(), 'imagenes', `${p!.projectId}/${p!.id}`);
    fs.readdirSync(projectDir).forEach(f=>{
        p!.img.push(`http://localhost:3000/static/${p!.projectId}/${p!.id}/${f}`)
    })
    res.status(200).send({data:p})
})

app.post('/ordenTrabajo', upload.any(), async (req, res) => {
    try {
        let piezas:any[] = []
        const files = req.files as Express.Multer.File[];
        req.body.piezas.forEach((pieza:any)=>{
            const ob = JSON.parse(pieza)
            const filenames = files.map(f=>{return f.originalname}).filter(f=>{
                return f.includes(ob.title)})!
            piezas.push({piezas:ob.piezas,title:ob.title,imgs:filenames})
        })
        const obj = await mongo.createOrden(piezas,req.body.idProject)
        const projectDir = path.join(process.cwd(), 'imagenes', `${req.body.idProject}/${obj.id}`);
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
            // Elimina la extensión original si existe y agrega la nueva
            const baseName = path.parse(file.originalname).name;
            const destPath = path.join(projectDir, baseName + ext);
            fs.renameSync(file.path, destPath);
        });

        res.status(200).send({ success: true, saved: files.length });
    } catch (err) {
        res.status(500).send({ error: 'Error al guardar imágenes', details: err });
    }
});

app.listen(port, async() => {
    console.log(`Server listening on port ${port}`);
});