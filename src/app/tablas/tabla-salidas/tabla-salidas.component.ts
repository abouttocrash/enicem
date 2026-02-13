import { Component, inject, input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SalidaService } from '../../salida.service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { baseDialog, createWhat, getStatusClass, longDialog, pad, projectDisabled } from '../../utils/Utils';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { createMilestone } from '@shared-types/Bitacora';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { DialogSalidaComponent } from '../../dialog-salida/dialog-salida.component';
import { MatDialog } from '@angular/material/dialog';
import { APIService } from '../../api.service';
import { ProyectoService } from '../../proyecto.service';
import { DialogEditarSalidaComponent } from '../../dialog-editar-salida/dialog-editar-salida.component';
import { Salida } from '@shared-types/Salida';

@Component({
  selector: 'tabla-salidas',
  imports: [MatTableModule, CdkDropList, CdkDrag, MatSortModule,CommonModule,MatIconModule],
  templateUrl: './tabla-salidas.component.html',
  styleUrl: './tabla-salidas.component.scss'
})
export class TablaSalidasComponent {
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = input.required<MatTableDataSource<Salida>>()
  displayedColumns = input.required<string[]>()
  showProyecto = input.required<boolean>()
  pad = pad
  projectDisabled = projectDisabled
  getStatusClass = getStatusClass
  readonly dialog = inject(MatDialog);
  constructor(public s:SalidaService,private api:APIService,private p:ProyectoService){}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.s.displayedColumns, event.previousIndex, event.currentIndex);
  }

  async revisarSalida(salida:any){
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
        const desc = `Salida con Folio #${r.data.folio} ${r.data.status} por ${this.api.currentUser.name} Razón: ${r.data.razon}`
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

  canApprove(){
    if(this.api.currentUser == undefined) return false
    return this.api.currentUser.actions.includes("APROBAR_ALMACEN")
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
}
