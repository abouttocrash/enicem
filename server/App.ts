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

app.listen(port, async() => {
    console.log(`Server listening on port ${port}`);
    const dataDir = path.join(process.cwd(), 'data')
    if(!fs.existsSync(dataDir)){
        mkdirSync(dataDir)
    }
});