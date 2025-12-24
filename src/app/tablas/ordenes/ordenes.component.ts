import { CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import { Component, input, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo';
import { fixAcabado, getStatusClass, pad } from '../../utils/Utils';
import { CommonModule } from '@angular/common';
import { MatDrawer } from '@angular/material/sidenav';
import { ProyectoService } from '../../proyecto.service';

@Component({
  selector: 'tabla-ordenes',
  imports: [MatTableModule,CdkDropList, CdkDrag,CommonModule,MatSortModule],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.scss'
})
export class OrdenesComponent {
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = input.required<MatTableDataSource<OrdenTrabajo>>()
  displayedColumns = input.required<string[]>()
  showProyecto = input.required<boolean>()
  drawer!:MatDrawer
  pad = pad
  fixAcabado = fixAcabado
  getStatusClass = getStatusClass

  constructor(private p:ProyectoService){}
  drop(event: any) {
    moveItemInArray(this.displayedColumns(), event.previousIndex, event.currentIndex);
  }

  calcularPendientes(row:OrdenTrabajo){
    return row.totalPiezas! - this.suma(row,"cantidadRecibida") 
  }

  suma(row:OrdenTrabajo,attr:"cantidadRechazada"|"cantidadRecibida"){
    const p = row.piezas
    let suma = 0;
    p.forEach(pieza=>{
      suma += pieza[attr].reduce((sum, val) => sum + Number(val || 0), 0)
    })
    return suma
  }

  async recibirPiezas(element:OrdenTrabajo){
    this.p.o.currentOrden = await this.p.o.getOrder(element._id)
    this.p.o.currentOrden.project = element.project
    await this.p.o.getImages()
    this.p.b.currentPieza = undefined
    this.p.o.piezasEnPanel = JSON.parse(JSON.stringify(this.p.o.currentOrden.piezas.slice())) || []
    this.drawer.open()
  }
}
