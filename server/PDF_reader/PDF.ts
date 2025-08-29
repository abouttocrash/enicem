
import fs from 'fs'
import pdfParse from "pdf-parse";
import path from 'path';
export class PDF{
    constructor(){}
    private getUploadsFolder() {
        return path.join(process.cwd(), 'uploads\\');
    }
    
    async readFolder(folder?:string){
        const dir = folder? folder: this.getUploadsFolder()
        let arr = []
        try{
            const files = fs.readdirSync(dir)
            for(let i = 0;i <files.length;i++){
            const b = fs.readFileSync(`${dir}${files[i]}`)
            const data = await pdfParse(b) as any;
            
            arr.push( this.extractObject(data.pageData[0],data.metadata._metadata))
            }
        }catch(e){
            console.log(e)
        }
        return arr
        
      
    }

    emptyUploads(){
        const dir = this.getUploadsFolder()
        fs.readdirSync(dir).forEach(file => {
            fs.unlinkSync(path.join(dir, file));
        });
    }
    async readBuffer(file:any){
        
         const data = await pdfParse(file) as any;
         console.log(data)
        
      
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
    };
}
}