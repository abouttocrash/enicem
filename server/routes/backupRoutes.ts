import { Router } from 'express';
import fs from 'fs'
import path from 'path'
import { printToLog } from '../Printer.js';
import { getLogger } from '../App.js';
const backupRouter = Router();
import {exec} from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);
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
        const backupDir = path.join(process.cwd(), 'mongodump')
        const { stdout, stderr } = await execPromise(`start cmd /c ${backupDir}/backup.bat`);
        printToLog("BACKUP Realizado")
        if(logger != undefined){
            logger.log({
                level: 'info',
                message: 'Backup realizado',
            });
        }
    
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