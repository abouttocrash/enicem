import moment from "moment"

export function printToLog(toPrint:string){
    console.log(`${toPrint} ${moment()}`)
}

export function pRed(text:string){
    return `\x1b[31m${text}\x1b[0m`
}
export function pGreen(text:string){
    return `\x1b[32m${text}\x1b[0m`
}
export function pYellow(text:any){
    return `\x1b[33m${text}\x1b[0m`
}
export function pBlue(text:any){
    return `\x1b[34m${text}\x1b[0m`
}
export function pMagenta(text:string){
    return `\x1b[35m${text}\x1b[0m`
}