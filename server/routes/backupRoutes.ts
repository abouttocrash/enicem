import { Router } from 'express';
import fs from 'fs'
import path from 'path'
import { printToLog } from '../Printer.js';
import { getLogger } from '../App.js';
const backupRouter = Router();
import {exec, spawn} from 'child_process';
import moment from 'moment';
//logs
backupRouter.post('/', async(req, res) => {
    await backup()
    res.status(200).send({data:true})
});

backupRouter.put("/",async(req,res)=>{
})

backupRouter.get("/",async(req,res)=>{
    const p = path.join(process.cwd(), 'backups')
    const folder = fs.readdirSync(p)
    const stats:{name:string,time:string}[] = []
    folder.forEach(f=>{
        const stat = fs.statSync(`${p}/${f}`)
        stats.push({name:f,time:stat.mtime.toLocaleString()})
    })
    res.status(200).send({data:stats})
})

export async function backup(){
    const logger = getLogger()
    try {
        const param =  moment().format("DD-MM-YY_hh-mm-ss")
        const backupDir = path.join(process.cwd(), 'mongodump')

        const bat = spawn('cmd.exe', ['/c', `${backupDir}/backup.bat ${param}`]);

        bat.stdout.on('data', (data) => {
            printToLog(`[backup stdout] ${data.toString()}`)
            if(logger != undefined){
            logger.log({
                level: 'info',
                message: `[backup stdout] ${data.toString()}`,
            });
        }
        });

        bat.stderr.on('data', (data) => {
            printToLog(`[backup stderr] ${data.toString()}`)
            logger.log({
                level: 'info',
                message: `[backup stderr] ${data.toString()}`,
            });
        });

        bat.on('exit', (code) => {
            printToLog(`[backup exit] ${code}`)
            logger.log({
                level: 'info',
                message: `[backup exit] ${code}`,
            });
        });
    
    } catch (error) {
        if(logger != undefined){
            logger.log({
                level: 'error',
                message: `[Backup] ${error}`,
            });
        }
        console.error(`exec error: ${error}`);

    }
}


export default backupRouter;