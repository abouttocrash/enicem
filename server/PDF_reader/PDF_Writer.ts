

import pdfPrinter from 'pdfmake'
import fs from 'fs';
import path from 'path';
import PdfPrinter from 'pdfmake';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo.js';
import moment from 'moment';
let fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};

var printer = new PdfPrinter(fonts);




export function writePDF(orden:OrdenTrabajo){
	try{
		const docDefinition = definePDF(orden)
		var pdfDoc = printer.createPdfKitDocument(docDefinition as any);
		const dir=path.join(process.cwd(), 'pdf-ordenes')
		const pathricio = `${dir}/${orden.folio}_${orden.idProject}_${orden.proveedor}.pdf`
		pdfDoc.pipe(fs.createWriteStream(pathricio));
		pdfDoc.end();
		return `${orden.folio}_${orden.idProject}_${orden.proveedor}.pdf`
	}catch(e){
		console.log("EXCEPTION")
		console.log(e)
		return e as Error
	}
}

function definePDF(orden:OrdenTrabajo){
	const projectDir = path.join(process.cwd(), 'imagenes', `${orden.idProject}/${orden._id}`);
	 let images:Array<string> = []
	if(fs.existsSync(projectDir))
		fs.readdirSync(projectDir).forEach(f=>{
			images.push(`${projectDir}/${f}`)
		})
	let tableBody = [
				[
					{ text: 'Id plano', style: 'tableHeader' },
					{ text: 'Material', style: 'tableHeader' },
					{ text: 'Acabado', style: 'tableHeader' },
					{ text: 'Cantidad', style: 'tableHeader' }
				],
				
	]
	orden.piezas.forEach(p=>{
		tableBody.push([
			{text:p.title,alignment:'left',fontSize: 8} as any,
			{text:p.material,alignment:'left',fontSize: 8} as any,
			{text:p.acabado,alignment:'left',fontSize: 8} as any,
			{text:p.piezas,alignment:'right',fontSize: 8} as any,
		])
	})
	tableBody.push([
			{text:"",alignment:'left',fontSize: 8} as any,
			{text:"",alignment:'left',fontSize: 8} as any,
			{text:"Total de piezas",alignment:'left',fontSize: 8,bold:true} as any,
			{text:orden.totalPiezas,alignment:'right',fontSize: 8,bold:true} as any,
		])
	let docDefinition = {
	pageSize: 'LETTER',
	pageMargins: [40, 40, 40, 144],
	footer: function(currentPage:number, pageCount:number) {
		
        // if(currentPage == pageCount) {
            return {
				 margin: [30, 10, 30, 0], // [left, top, right, bottom]
			stack:[
					{
						table: {
						widths: ['*'], // This makes the single column expand to fill available width
						body: [
						[
							{
								stack:[
								{
								text: '\n\n',
								
								alignment: 'center',
								margin: [0, 10] 
								},
								,{
									text:"Notas:",
									fontSize:10,
									absolutePosition: { x: 34, y: 14 }
								}
								]
							},
							
						]
						],
						
						},
				},
					{
						table: {
						widths: ['*',"*"], // This makes the single column expand to fill available width
						body: [
						[
							{
								stack:[
								{
								text: '\n\n',
								
								alignment: 'center',
								margin: [0, 10] 
								},
								,{
									text:"Nombre y firma de quien recibe",
									fontSize:10,
									absolutePosition: { x: 80, y: 100 }
								}
								]
							},
							
							{
								stack:[
								{
								text: '\n\n',
								
								alignment: 'center',
								margin: [0, 10] 
								},
								,{
									text:"Nombre y firma de quien recibe",
									fontSize:10,
									absolutePosition: { x: 372, y: 100}
								}
								]
							}
						]
						]
						},
				}
			]
					
				
			}
            
    //   } else {
    //     return {
	// 			 margin: [30, 10, 30, 80], // [left, top, right, bottom]
			
					
	// 					table: {
	// 					widths: ['*',"*"], // This makes the single column expand to fill available width
	// 					body: [
	// 					[
	// 						{
	// 							stack:[
	// 							{
	// 							text: '\n\n',
								
	// 							alignment: 'center',
	// 							margin: [0, 10] 
	// 							},
	// 							,{
	// 								text:"Nombre y firma de quien recibe",
	// 								fontSize:10,
	// 								absolutePosition: { x: 80, y: 48 }
	// 							}
	// 							]
	// 						},
							
	// 						{
	// 							stack:[
	// 							{
	// 							text: '\n\n',
								
	// 							alignment: 'center',
	// 							margin: [0, 10] 
	// 							},
	// 							,{
	// 								text:"Nombre y firma de quien recibe",
	// 								fontSize:10,
	// 								absolutePosition: { x: 372, y: 48 }
	// 							}
	// 							]
	// 						}
	// 					]
	// 					]
	// 					},
				
			
					
				
	// 		}
    //   }
	},
	content: [
		{
			image: 'logo.png',
			width: 100,
			absolutePosition: { x: 40, y: 25 }
		},
		{
			
			columns: [
				
				{},
				{
					text: 'Orden de trabajo',
					style: 'header',
					alignment: 'center'
				},
				{
					stack:[
						
						{
							text:[
								{text:"No. Folio: ",bold:true,fontSize: 10},
								{text:orden.folio,fontSize: 8}
							],
							margin:[0,1,0,1]
						},
						{
							text:[
								{text:"Fecha: ",bold:true,fontSize: 10},
								{text:moment().locale("es").format("DD MMMM YYYY"),fontSize: 8}
							],
							margin:[0,1,0,1]
						},
						{
							text:[
								{text:"Fecha esperada: ",bold:true,fontSize: 10},
								{text:orden.dateEntrega,fontSize: 8}
							],
							margin:[0,1,0,1]
						},
						{
							text:[
								{text:"Total de piezas: ",bold:true,fontSize: 10},
								{text:orden.totalPiezas,fontSize: 8}
							],
							margin:[0,1,0,1]
						},
						
					],
					absolutePosition: { x: 430, y: 20 }
				}
			]
		},
		
		{
			stack:[
				
				{
					text:[
						{text:"Proveedor: ",bold:true,fontSize: 10},
						{text:orden.proveedor,fontSize: 10}
					],
				},
				{
					text:[
						{text:"Proyecto: ",bold:true,fontSize: 10},
						{text:orden.project,fontSize: 10},
						
					],
					margin:[0,0,0,20]
				},
				
				
			],
					
		},
		{
			table: {
				headerRows: 1,
				widths: [200, '*', '*', 70],
				body: tableBody,
				
			},
			pageBreak: 'after'
		}
	],
	styles: {
		header: {
			fontSize: 18,
			bold: true,
			margin: [0, 0, 0, 10]
		},
		tableHeader: {
			bold: true,
			fontSize: 10,
			color: 'black'
		}
	}
	
	};
	let columns:any[] = []
	images.forEach((img,i)=>{
		columns.push({
			
			image: img,
			width: 200,
			margin:10
			
		}as any)
		columns.push({
			text:"     ",
			width:5
		})
		if((i+1) % 2 == 0 || i == images.length-1){
			docDefinition.content.push({columns:columns})
			columns = []
		}
	})
	if(images.length == 0)
		delete docDefinition.content[3]?.pageBreak
	return docDefinition
}