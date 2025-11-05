
import fs, { mkdir, mkdirSync } from 'fs'
import pdfParse from "pdf-parse";
import path from 'path';
import { PDFDocument, PDFImage, PageSizes, StandardFonts, rgb } from 'pdf-lib'
import { Pieza } from '@shared-types/Pieza.js';
import { ip, UPLOADS_PATH } from '../App.js';
export class PDF{
    constructor(){}
    private getUploadsFolder(idProject:string) {
        
        return `${UPLOADS_PATH}/${idProject}`
    }
    
    async readFolder(idProject:string){
        const dir = this.getUploadsFolder(idProject)

        let errored = false
        let arr:Pieza[] = []
        let i = 0;
        try{
            const files = fs.readdirSync(dir)
            for(i = 0;i <files.length;i++){
                const b = fs.readFileSync(`${dir}/${files[i]}`)
                const data = await pdfParse(b) as any;
                if(data.metadata == null || data.metadata == undefined){
                    data.metadata = {
                        _metadata:{
                            "dc:creator":"INVALID",
                            "dc:title":"INVALID"
                        }
                    }
                    console.log(`Plano Inválido ${files[i]}`)
                }
                arr.push(this.extractObject(data.pageData[0],data.metadata._metadata))
            }
        }catch(e){
            errored = true
            arr = []
            console.log(e)
        }
        return arr
        
      
    }
    emptyOne(projectId:string,filename:string){
        const dir = `${UPLOADS_PATH}/${projectId}`
        try{
            console.log(`${dir}/${filename}`)
            fs.unlinkSync(`${dir}/${filename}`)
        }catch(e){
            console.log("NOT FOUND")
        }
    }
    emptyUploads(projectId:string,create = true){
        const dir = `${UPLOADS_PATH}/${projectId}`
        const dataDir = path.join(process.cwd(), 'data',projectId)
        fs.mkdirSync(dataDir, { recursive: true });
        fs.readdirSync(dir).forEach(file => {
            
            const srcPath = path.join(dir, file);
            const tgtPath = path.join(dataDir, file);
            if(create)
                fs.copyFileSync(srcPath, tgtPath);
        
            fs.unlinkSync(path.join(dir, file));
        });
        return true
    }

    extractObject(text: string,metadata:any){
        const materialMatch = text.match(/Material:\s*([^\n]+)/i);
        const acabadoMatch = text.match(/Acabado:\s*([^\n]+)/i);
        const piezasMatch = text.match(/Piezas:\s*([^\n]+)/i);

        return {
            material: materialMatch ? materialMatch[1]!.trim() : null,
            acabado: acabadoMatch ? acabadoMatch[1]!.trim() : null,
            piezas: piezasMatch ? piezasMatch[1]!.trim() : null,
            autor:metadata["dc:creator"],
            title:metadata["dc:title"]
        } as Pieza
    }

    async createPDF(orden:any){
        console.log(orden)
        const pdfDoc = await PDFDocument.create()
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const page = pdfDoc.addPage(PageSizes.A4)
        const { width, height } = page.getSize()

        const fontSize = 30
        page.drawText('Nueva orden!', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: font,
        color: rgb(0, 0.53, 0.71),
        })
        const pngImages = await this.getImages(pdfDoc,orden.data.img)
        let x = 0
        pngImages.forEach(im=>{
            const pngDims = im.scale(0.5)
            page.drawImage(im, {
            x:x,
            y: page.getHeight() / 2 - pngDims.height,
            width: pngDims.width,
            height: pngDims.height,
            
        })
            x += page.getWidth() / 2 - pngDims.width / 2 + 75
        })
        const pdfBytes = await pdfDoc.save()
        const buffer = Buffer.from(pdfBytes as Uint8Array).toString('base64')
        return buffer
    }

    private async getImages(pdfDoc:PDFDocument,imagenes:any[]){
        let arr = []
        let l
        for(let i =0;i<imagenes.length;i++){
            let realPath = imagenes[i].split(`${ip}/static/`) as string
            //TODO solo jpg o png o buscar otro formato
            //SOI not found in JPEG
            const format = realPath.includes("png") ? "png" : "jpg"
            const pngImageBytes = fs.readFileSync(`imagenes/${realPath[1]}`)
            let img:PDFImage
                img = await pdfDoc.embedPng(pngImageBytes)
            
            arr.push(img)
        }
       
        return arr
    }
}