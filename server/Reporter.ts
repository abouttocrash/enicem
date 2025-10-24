import { OrdenTrabajo } from '@shared-types/OrdenTrabajo.js'
import { Catalogo } from '@shared-types/Pieza.js'
import { Proyecto } from '@shared-types/Proyecto.js'
import { Usuario } from '@shared-types/Usuario.js'
import ExcelJS from 'exceljs'
import moment from 'moment'
export class Reporter{
    private workbook:ExcelJS.Workbook
    private worksheet:ExcelJS.Worksheet
    constructor(){
        this.workbook = new ExcelJS.Workbook()
        this.worksheet = this.workbook.addWorksheet("Reporte")
    }
    async buildByProveedor(ordenes:OrdenTrabajo[],f1:string,f2:string,proveedores:Usuario[],proyectos:Proyecto[],idProveedor:string){
        this.worksheet.addRow([`Rango: ${f1} - ${f2}` ,"Reporte creado: "+moment().locale("es").format("DD MMMM YYYY")])
        const headerRow = this.worksheet.addRow(["Proyecto",	"Proveedor",	"Órdenes en el periodo", 
            "Piezas solicitadas","Pendientes por recibir"])
            console.log(ordenes.length)
        const proyectoSet = Array.from(new Set(ordenes.map(o => {return o.idProject })))
         headerRow.eachCell(cell => {
            cell.font = Object.assign({}, cell.font, { bold: true });
        });
        proyectoSet.forEach(p=>{
            const filteredOrdenes = ordenes.filter(o=>{return o.idProject == p})
            let piezasSolicitadas = 0;
            let piezasMissed = 0;
            let piezasNotMissed = 0
            filteredOrdenes.forEach(o=>{
                const dateEntrega = moment(o.dateEntrega)
                o.missed = 0;
                o.notMissed = 0;
                o.piezas.forEach(p=>{
                    p.fechaRecibida.forEach(pr=>{
                        const fechaRecibida = moment(pr.fecha)
                        if(fechaRecibida.isAfter(dateEntrega))
                            o.missed! += pr.c
                        else
                            o.notMissed! += pr.c
                    })
                    if(o.status == "ABIERTA")
                        o.missed! += Number(p.piezas) - o.notMissed!
                })
                piezasSolicitadas += o.piezas.reduce((sum: number, p: any) => sum + Number(p.piezas), 0);
                piezasMissed += o.missed!
                piezasNotMissed += o.notMissed!
            })
            this.worksheet.addRow([
                proyectos.find(py=>{return py._id == p})?.name,
                proveedores.find(pr=>{return pr._id == idProveedor})!.name,
                filteredOrdenes.length,
                piezasSolicitadas,
                piezasMissed,
            ])
        })
        const buffer = await this.workbook.xlsx.writeBuffer()
        return buffer
    }
    async build(ordenes:Array<OrdenTrabajo>,f1:string,f2:string,proveedores:Usuario[]){
        this.worksheet.addRow([`Rango: ${f1} - ${f2}` ,"Reporte creado: "+moment().locale("es").format("DD MMMM YYYY")])
        const headerRow = this.worksheet.addRow(["Nombre de proveedor",	"# de ordenes en el periodo",	"Piezas solicitadas", 
            "Piezas recibidas en tiempo","Piezas no recibidas en tiempo",	"% cumplimiento proveedor"])
        const proveedoresSet = Array.from(new Set(ordenes.map(o => {return o.idProveedor })))
        headerRow.eachCell(cell => {
            cell.font = Object.assign({}, cell.font, { bold: true });
        });
        proveedoresSet.forEach(p=>{
            const filteredOrdenes = ordenes.filter(o=>{return o.idProveedor == p})
            let piezasSolicitadas = 0;
            let piezasMissed = 0;
            let piezasNotMissed = 0
            filteredOrdenes.forEach(o=>{
                const dateEntrega = moment(o.dateEntrega)
                o.missed = 0;
                o.notMissed = 0;
                o.piezas.forEach(p=>{
                    p.fechaRecibida.forEach(pr=>{
                        const fechaRecibida = moment(pr.fecha)
                        if(fechaRecibida.isAfter(dateEntrega))
                            o.missed! += pr.c
                        else
                            o.notMissed! += pr.c
                    })
                    if(o.status == "ABIERTA")
                        o.missed! += Number(p.piezas) - o.notMissed!
                })
                piezasSolicitadas += o.piezas.reduce((sum: number, p: any) => sum + Number(p.piezas), 0);
                piezasMissed += o.missed!
                piezasNotMissed += o.notMissed!
            })
            this.worksheet.addRow([
                proveedores.find(pr=>{return pr._id == p})!.name,
                filteredOrdenes.length,
                piezasSolicitadas,
                piezasNotMissed,
                piezasMissed,
                `${(piezasNotMissed * 100 / piezasSolicitadas).toFixed(1)}%`
            ])
        })
        const buffer = await this.workbook.xlsx.writeBuffer()
        return buffer

    }
    

    async buildCatalogo(catalogo:Catalogo,proyecto:Proyecto){
        this.worksheet.addRow([`Proyecto: ${proyecto.name}`,proyecto.noSerie ,"Reporte creado: "+moment().locale("es").format("DD MMMM YYYY")])
        const headerRow = this.worksheet.addRow(["Id Plano","Material", "Acabado","Cantidad en plano","Maquinadas","Detalladas","En Integración","Rechazadas"])
        headerRow.eachCell(cell => {
            cell.font = Object.assign({}, cell.font, { bold: true });
        });

        this.worksheet.getColumn(1).width = 60;
        this.worksheet.getColumn(2).width = 30;
        this.worksheet.getColumn(3).width = 30;

        catalogo.logs.forEach(c=>{
            this.worksheet.addRow([
                c.title,
                c.material,
                c.acabado,
                c.piezas,
                c.cantidadManufactura.reduce((a: number, b: any) => a + Number(b || 0), 0),
                c.cantidadDetalle.reduce((a: number, b: any) => a + Number(b || 0), 0),
                c.cantidadAlmacen.reduce((a: number, b: any) => a + Number(b || 0), 0),
                c.cantidadRechazada.reduce((a: number, b: any) => a + Number(b || 0), 0),
                ])
        })
        const buffer = await this.workbook.xlsx.writeBuffer()
        return buffer

    }

    recibidasATiempo(orden:OrdenTrabajo){
        let aTiempo = 0
        orden.piezas.forEach(p=>{
            p.fechaRecibida.forEach(c=>{
                if(moment(c.fecha).isBefore(moment(orden.dateEntrega))){
                    aTiempo += c.c
                }
            })
        })
        return aTiempo
    }
}