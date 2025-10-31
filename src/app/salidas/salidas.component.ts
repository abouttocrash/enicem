import { Component, inject, Inject, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { SalidaService } from '../salida.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import { Salida } from '@shared-types/Salida';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { createMilestone } from '@shared-types/Bitacora';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { DialogSalidaComponent } from '../dialog-salida/dialog-salida.component';
import { longDialog, createWhat, baseDialog, projectDisabled } from '../utils/Utils';
import { DialogEditarSalidaComponent } from '../dialog-editar-salida/dialog-editar-salida.component';
import { APIService } from '../api.service';
import { ProyectoService } from '../proyecto.service';
import { MatTooltip } from "@angular/material/tooltip";
import { AutoFilter, AutoIcemComponent } from '../components/auto-icem/auto-icem.component';
@Component({
  selector: 'salidas',
  imports: [
    MatTableModule, MatIconModule, MatFormFieldModule,
    MatDialogModule,AutoIcemComponent,
    MatInputModule, CdkDropList, CdkDrag, MatSortModule,
    MatTooltip
],
  templateUrl: './salidas.component.html',
  styleUrl: './salidas.component.scss'
})
export class SalidasComponent {
  readonly dialog = inject(MatDialog);
  projectDisabled = projectDisabled
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  filters:Array<AutoFilter>=[
      {
        filter:"Tipo",
        options:[]
      },
      {
        filter:"Creada por",
        options:[]
      },
      {
        filter:"Proyecto",
        options:[]
      },
      {
        filter:"Status",
        options:[]
      },
    ]
    filteredFilters:Array<AutoFilter> = []
  constructor(public s:SalidaService,private api:APIService,private p:ProyectoService){}

  init(data:Salida[]){
    data.forEach((d:any)=>{
      if(d.project == undefined)
        d.project = this.api.currentProject.name
    })
    const r = this.s.init(data,this.sort)
    this.initFilters(data)
    
  }

  //TODO
  initFilters(s:any[]){
    this.filters[0].options = Array.from(new Set(s.map(d=>{return d.tipo})))
    this.filters[1].options = Array.from(new Set(s.map(d=>{return d.usuario})))
    this.filters[2].options = Array.from(new Set(s.map(d=>{return d.project!})))
    this.filters[3].options = Array.from(new Set(s.map(d=>{return d.status!})))
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
  }

  async getPDF(salida:Salida){
    let x = salida as any
    x.idProject = this.api.currentProject._id
    const body = {
      salida:x
    }
    const r = await this.api.POST<any>("pdf/salida",body)
    window.open(r.data.path, '_blank');
  }

 async editarSalida(salida:any){
    const dialog = this.dialog.open(DialogEditarSalidaComponent,{
      ...baseDialog,
      data: JSON.parse(JSON.stringify(salida))
    });
    const r = await firstValueFrom(dialog.afterClosed())
    if(r.bool ){
      r.data.modifiedBy = this.api.currentUser.name
      r.data.modifiedById = this.api.currentUser._id
      r.data.modifiedDate = moment().endOf("D").toISOString()
      await this.s.updateCantidadSalida(r.data)
      const desc = `(Nuevas cantidades) Salida con Folio ${r.data.folio} Modificada por ${this.api.currentUser.name}`
      const what = createWhat(r.data.salidas,"piezas")
      await this.api.updateLog(createMilestone(desc,r.data._id,this.api.currentUser._id!,what,""))
      await this.p.getAll()
    }
  }

  applyFilter(event: Event | string) {
    let filterValue = ""
    if (event instanceof KeyboardEvent) {
      const k = event.key;
      if (/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/i.test(k)) {
        return;
      }
    }
   
    if(typeof event == "string")
      filterValue = event.trim().toLowerCase();
    else
      filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.s.dataSource.filterPredicate = (data: any, filter: string) => {
       
      const matchUsuario = data.usuario.toLowerCase().includes(filter);
      const matchTipo = data.tipo.toLowerCase().includes(filter)
      const matchProyecto = data.project!.toLowerCase().includes(filter)
      const matchStatus = data.status!.toLowerCase().includes(filter)
      
      return matchUsuario || matchTipo || matchStatus || matchProyecto
    };
    this.s.dataSource.filter = filterValue;
    this.filteredFilters = this.auto.filterGroup(filterValue)
  }

  drop(event: CdkDragDrop<string[]>) {
    
    moveItemInArray(this.s.displayedColumns, event.previousIndex, event.currentIndex);
  }


   async abrirDialogoSalida(salida:any){
      if(salida.tipo == "Integración" && salida.status == "ABIERTA"){
        const dialog = this.dialog.open(DialogSalidaComponent,{
          ...longDialog,
          data: JSON.parse(JSON.stringify(salida))
        });
        const r = await firstValueFrom(dialog.afterClosed())
        if(r.bool ){
          r.data.modifiedBy = this.api.currentUser.name
          r.data.modifiedById = this.api.currentUser._id
          r.data.modifiedDate = moment().endOf("D").toISOString()
          await this.s.updateSalida(r.data)
          const desc = `Salida con Folio #${r.data.folio} ${r.data.status} por ${this.api.currentUser.name}`
          const what = createWhat(r.data.salidas,"piezas")
          await this.api.updateLog(createMilestone(desc,r.data._id,this.api.currentUser._id!,what,""))
          
          if(r.data.status == "APROBADA"){
          const bodyStock = {
            piezas:what,
            catalogId:this.api.currentProject.catalogId!,
            razon:"SALIDA Integración"
          }
       
          await this.api.updateStock(bodyStock)
          
          } 
          await this.p.getAll()
          
        }
      }
      
    }

  canApprove(){
    if(this.api.currentUser == undefined) return false
    return this.api.currentUser.actions.includes("APROBAR_ALMACEN")
  }
}
