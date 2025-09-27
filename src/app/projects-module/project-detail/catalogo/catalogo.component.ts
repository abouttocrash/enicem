import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { APIService } from '../../../api.service';
import { StorageService } from '../../../storage.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BARComponent } from '../bar/bar.component';
import { MatDrawer } from '@angular/material/sidenav';
import { DialogOrdenComponent } from '../../../ordenes/dialog-orden/dialog-orden.component';
import { OrdenesTrabajoComponent } from '../../../ordenes/ordenes-trabajo/ordenes-trabajo.component';
import { BitacoraComponent } from '../bitacora/bitacora.component';
import { MILESTONE_DESC } from '@shared-types/Bitacora';
import { ProyectoService } from '../../../proyecto.service';
import { SalidaAlmacenComponent } from './salida-almacen/salida-almacen.component';
import { Pieza } from '@shared-types/Pieza';

@Component({
  selector: 'catalogo',
  imports: [MatTableModule,MatIconModule,MatCheckboxModule,FormsModule,
    MatSortModule,BARComponent
  ],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent {
  @ViewChild('folderInput') folderInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatSort) sort!: MatSort;
  readonly dialog = inject(MatDialog);
 
  tableChecked = false
  currentPieza = {} as any
  textoPlanos = "Crear Bitácora"
  drawer!:MatDrawer
  constructor(public api:APIService,private storage:StorageService,public p:ProyectoService){}

  async init(drawer:MatDrawer){
    this.drawer = drawer
    const r = await this.p.c.init(this.sort)
    this.textoPlanos = r.data.logs.length > 0 ? "Agregar planos" : "Crear Catálogo"
  }

  getFolders() {
    this.folderInput.nativeElement.value = '';
    this.folderInput.nativeElement.click();
  }

  async onFolderSelected(event: Event) {
    const formData = new FormData();
    let files:any[] = []
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) 
      files = Array.from(input.files);
      
    files.forEach(file => formData.append('files', file, file.name));
    try{
      //TODO checar porque fallo
      //Warning: Indexing all PDF objects
      //message: 'Invalid PDF structure'
      const response = await this.api.createCatalog(formData,this.api.currentProject._id!)
      this.p.c.catalogId = response.log.insertedId
      this.api.currentProject.catalogId = response.log.insertedId
      this.api.currentProject.piezasCount = files.length
      const r = await this.api.updateProject(files.length)
      await this.api.updateLog({description:MILESTONE_DESC.CATALOG_CREATED,generalId:response.log.insertedId,createdBy:this.api.currentUser._id,expand:true})
      this.storage.setProject(this.api.currentProject)
      await this.api.getProjects("ABIERTO")
      await this.p.getAll()
    }catch(e){throw e}

  }

  salidaAlmacen(){
    const selected = this.p.c.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(SalidaAlmacenComponent,{
      width:"500px",
      height:"600px",
      disableClose:true,
      data: JSON.parse(JSON.stringify(selected)),
        
    });
    dialog.afterClosed().subscribe(async(r:{bool:boolean,piezas:Pieza[]})=>{
      if(r){
        await this.p.c.createAlmacen(r.piezas)
        await this.p.getAll()
      }
    })
  }
  
  createOrder(){
   const selected = this.p.c.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(DialogOrdenComponent,{
      disableClose:true,
      height:"700px",
      width:"700px",
      data: {
        list:JSON.parse(JSON.stringify(selected)),
        project:this.api.currentProject
      },
    });
    dialog.afterClosed().subscribe(async(r:boolean)=>{
      if(r)
        await this.p.getAll()
    })
  }
  partiallyComplete() {
    if(this.p.c.dataSource){
      const completed =  this.p.c.dataSource.data.some(t => t.checked) && !this.p.c.dataSource.data.every(t => t.checked)
      return completed
    }
    return false
    
  }

  updateRow(row:any){
    this.tableChecked = this.p.c.dataSource.data.every(t => t.checked)
  }
  checkTable(){
    this.p.c.dataSource.data.forEach(r=>{
      r.checked = this.tableChecked
    })
  }

  sum(data:number[]){
    return data.reduce((sum: number, p: any) => sum + Number(p), 0);
  }

  toggle(row:any){
    this.currentPieza = row
    const idProyecto = this.api.currentProject._id!
    const url = `http://localhost:3000/static/${idProyecto}/${row.title}.pdf`;
    window.open(url, '_blank');
  }
}
