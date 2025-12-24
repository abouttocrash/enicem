import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { APIService } from '../../../api.service';
import { StorageService } from '../../../storage.service';
import { MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { DialogOrdenComponent } from '../../../ordenes/dialog-orden/dialog-orden.component';
import { createMilestone, Milestone, MILESTONE_DESC, What } from '@shared-types/Bitacora';
import { ProyectoService } from '../../../proyecto.service';
import { SalidaAlmacenComponent } from './salida-almacen/salida-almacen.component';
import { Catalogo, Pieza } from '@shared-types/Pieza';
import { MatSnackBar } from '@angular/material/snack-bar';
import { baseDialog, createWhat, longDialog, longerDialog, projectDisabled } from '../../../utils/Utils';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, CdkDragStart} from '@angular/cdk/drag-drop';
import { DialogoScrapComponent } from './dialogo-scrap/dialogo-scrap.component';
import { MultiDialogComponent } from '../../../multi-dialog/multi-dialog.component';
import { firstValueFrom } from 'rxjs';
import { DialogConfirmComponent } from '../../../components/dialog-confirm/dialog-confirm.component';
@Component({
  selector: 'catalogo',
  imports: [MatTableModule, MatIconModule, MatCheckboxModule, FormsModule,
    MatSortModule, MatTooltipModule,MatFormFieldModule,MatInputModule,CdkDropList, CdkDrag],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent {

  @ViewChild(MatSort) sort!: MatSort;
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  projectDisabled = projectDisabled
  tableChecked = false
  currentPieza = {} as any
  drawer!:MatDrawer
  textoPlanos = "Crear Bitácora"
  displayedColumns: string[] = ['box','title','material','acabado','piezas','cantidadManufactura','cantidadDetalle','cantidadAlmacen','cantidadRechazada', 'asociadas','stockNumber', 'expand','remove'];
  
  constructor(public api:APIService,private storage:StorageService,public p:ProyectoService){
    
  }
  
  drop(event: CdkDragDrop<string[]>) {
    
    if(
      event.currentIndex == 0 ||
      event.previousIndex == 0 ||
      event.currentIndex == this.displayedColumns.length -1 ||
      event.previousIndex == this.displayedColumns.length -1
    )return
    
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
  init(data:Catalogo,drawer:MatDrawer){
    if(data.logs.length > 0)
        this.textoPlanos = "Agregar planos adicionales"
    this.drawer = drawer
    this.p.c.init(data,this.sort)
  }
  

async agregarPlanos() {
  const dialog = this.dialog.open(MultiDialogComponent,{
      ...longerDialog,
      disableClose:true,
      data:{
        action:"EDITAR",
        planos:this.p.c.dataSource.data
      }
    });
    const r = await firstValueFrom(dialog.afterClosed())
    if(r.bool){
      const ref = this._snackBar.open("actualizando bitácora")
      const milestone = createMilestone("Planos agregados al catálogo",this.api.currentProject.catalogId!,this.api.currentUser._id!,[],"")
      const res = await this.p.c.updateCatalog(milestone)
      if(res.response != undefined){
        this._snackBar.open("Bitácora actualizada","OK",{duration:2000})
        await this.p.getAll()
      }
      else
        this._snackBar.open("Ha ocurrido un error","OK",{duration:2000})
      
    }

  
}
  async getFolders() {
    const r = await this.validarPlanos()
    
  }
  async validarPlanos(){
    const dialog = this.dialog.open(MultiDialogComponent,{
      ...longerDialog,
      disableClose:true,
      data:{
        action:"AGREGAR",
        planos:[]
      }
    });
    const r = await firstValueFrom(dialog.afterClosed())
    if(r.bool){
      const ref = this._snackBar.open("Creando bitácora")
      const milestone = createMilestone(MILESTONE_DESC.CATALOG_CREATED,"X",this.api.currentUser._id,[],"-",false)
      const res = await this.p.c.createCatalog(milestone)
    if(res.response){
      this.api.currentProject.catalogId = res.response.catalogId
      this.storage.setProject(this.api.currentProject)
      await this.p.getAll()
      this.textoPlanos = "Agregar planos adicionales"
      ref.dismiss()
      this._snackBar.open("✔️ Bitácora creada","OK",{duration:2000})
    }
    else
      this._snackBar.open("Ha ocurrido un error, inténtelo nuevamente","OK",{duration:5000})
    }
    return r as {bool:boolean,data:any[]}
  }

  salidaAlmacen(){
    const selected = this.p.c.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(SalidaAlmacenComponent,{
      ...baseDialog,
      data: JSON.parse(JSON.stringify(selected)),
        
    });
    dialog.afterClosed().subscribe(async(r:{bool:boolean,piezas:Pieza[]})=>{
      if(r.bool){
        await this.p.c.createAlmacen(r.piezas)
        await this.p.getAll()
      }
    })
  }

  scrap(){
    const selected = this.p.c.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(DialogoScrapComponent,{
      ...baseDialog,
      data: JSON.parse(JSON.stringify(selected)),
        
    });
    dialog.afterClosed().subscribe(async(r:{bool:boolean,piezas:Pieza[]})=>{
      if(r.bool){
        await this.p.c.createScrap(r.piezas)
        await this.p.getAll()
      }
    })
  }
  
  async createOrder(){
  
    const selected = this.p.c.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(DialogOrdenComponent,{
      ...longDialog,
      data: {
        list:JSON.parse(JSON.stringify(selected)),
        project:this.api.currentProject
      },
    });
    dialog.afterClosed().subscribe(async(r:{close:boolean,todoBien:boolean})=>{
      if(r.close){
        if(r.todoBien){
          this._snackBar.open("Orden creada con éxito","OK",{duration:1000})
          await this.p.getAll()
          this.tableChecked = false
        }
        else{
          this._snackBar.open("Información de bitácora desactualizada, actualiza la información para proceder","OK",{duration:5000})
        }
        
      }
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

  sumStock(row:Pieza){
    return this.sum(row.stock.map(s=>{return s.c}))
  }

  getAsociadas(row:Pieza){
    return row.asociadas?.length || 0
  }

  openPanel(pieza:Pieza){
    this.p.b.currentPieza = pieza
    this.p.o.currentOrden = undefined
    const bitacoraPieza = this.p.b.dataSource.data.filter((m:Milestone)=>{
      return m.what?.find(w=>{return w.plano == pieza.title})
    }).map(f=>{
      let x = structuredClone(f) as any
      x.pieza = x.what!.find((w:What)=>{return w.plano == pieza.title})!
      switch(true){
        case x.description.includes("Orden de Maquinado Creada"):
        x.description = `En orden de Maquinado #${x.description.split("#")[1]}`
        break;
        case x.description.includes("Piezas recibidas para orden de Maquinado"):
        x.description = `Recibida en Maquinado #${x.description.split("#")[1]}`
        break;
       
        case x.description.includes("Piezas recibidas para orden de Detalle"):
        x.description = `Recibida en Detallado #${x.description.split("#")[1]}`
        break;
        case x.description.includes("solicitadas a almacen"):
        x.description = `Solicitada a almacen #${x.description.split("#")[1]}`
        break;
        case x.description.includes("rechazadas para orden de Detalle "):
        x.description = `Rechazada en Detallado #${x.description.split("#")[1].replace("Razón: ","➡️")}`
        break;

      }
      return x
    })
    this.p.b.bitacoraPieza = bitacoraPieza
    this.drawer.open()
  }

  toggle(row:Pieza,$event:Event){
    $event.stopPropagation()
    this.currentPieza = row
    const idProyecto = this.api.currentProject._id!
    const actualTitle = row.title.replace("(ESPEJO)","").trim()
    const url = `${this.api.BASE_NO_API}/static/${idProyecto}/${actualTitle}.pdf`;
    window.open(url, '_blank');
  }

  async deletePlano(row:Pieza,$event:Event){
    $event.stopPropagation()
    const d = this.dialog.open(DialogConfirmComponent,{
      width:"340px",
      height:"260px",
      disableClose:false,
      data:{accion:"ELIMINAR PLANO DE BITÁCORA "+row.title}
    })
    
    const r = await firstValueFrom(d.afterClosed())
    if(r){
      const bool = await this.p.c.removePieza(row.title)
      if(bool){
        this._snackBar.open("Plano removido de la bitácora","OK",{duration:2000})
        await this.p.getAll()
      }
      else{
        this._snackBar.open("No se pudo remover el plano, cheque la consola","OK",{duration:5000})
      }
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.p.c.dataSource.filter = filterValue.trim().toLowerCase();
  }

  sumAttr(attr: string): number {
    if (!this.p?.c?.dataSource?.data) return 0;
    return this.p.c.dataSource.data.reduce((total: number, row: any) => {
      let val = row[attr];
      // Si es un array, suma sus elementos; si es número, suma directo
      if (Array.isArray(val)) {
        val = val || []
        return total + val.reduce((a: number, b: any) => a + Number(b || 0), 0);
      }
      return total + Number(val || 0);
    }, 0);
  }

  async excel(){
    const r = await this.p.c.reporteCatalogo()
    window.open(r.data.path, '_blank');
  }
}
