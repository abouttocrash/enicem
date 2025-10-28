import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogOrdenComponent } from '../dialog-orden/dialog-orden.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo';
import { ProyectoService } from '../../proyecto.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import { _filter, AutoFilter, AutoIcemComponent } from '../../components/auto-icem/auto-icem.component';

@Component({
  selector: 'ordenes-trabajo',
  imports: [MatIconModule,MatTableModule,MatSortModule,AutoIcemComponent,
    MatSidenavModule,MatFormFieldModule,MatInputModule,MatAutocompleteModule,CdkDropList, CdkDrag],
  templateUrl: './ordenes-trabajo.component.html',
  styleUrl: './ordenes-trabajo.component.scss'
})
export class OrdenesTrabajoComponent {
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  readonly dialog = inject(MatDialog);
  @ViewChild(MatSort) sort!: MatSort;
  
  
  drawer!:MatDrawer
  
  constructor(public p:ProyectoService){}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.p.o.displayedColumns, event.previousIndex, event.currentIndex);
  }

 
  init(data:OrdenTrabajo[],drawer:MatDrawer){
    this.drawer = drawer
    this.p.b.currentPieza = undefined
    const r = this.p.o.init(data,drawer,this.sort)
    
  }
  createOrder(checked:Array<any>){
    //const selected = this.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(DialogOrdenComponent,{
      data: {
        list:JSON.parse(JSON.stringify(checked))
      },
    });
    
  }

 applyFilter(event: Event | string) {
  let filterValue = ""
  if(typeof event == "string")
    filterValue = event.trim().toLowerCase();
  else
    filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.p.o.dataSource.filterPredicate = (data: OrdenTrabajo, filter: string) => {
      // Filtra por cualquier campo relevante
      const matchOrden = data.status.toLowerCase().includes(filter);
      const matchTipo = data.tipo.toLowerCase().includes(filter)
      const matchProveedor = data.proveedor.toLowerCase().includes(filter)
      // Filtra también por el título de cada pieza
      const matchPieza = Array.isArray(data.piezas)
          ? data.piezas.some((p: any) => p.title?.toLowerCase().includes(filter))
          : false;
      return matchOrden || matchPieza || matchTipo || matchProveedor;
  };
  this.p.o.dataSource.filter = filterValue;
  this.p.o.filteredFilters = this.auto.filterGroup(filterValue)
}

 

  async recibirPiezas(element:OrdenTrabajo){
    this.p.o.currentOrden = await this.p.o.getOrder(element._id)
    await this.p.o.getImages()
    this.p.b.currentPieza = undefined
    this.p.o.piezasEnPanel = JSON.parse(JSON.stringify(this.p.o.currentOrden.piezas.slice())) || []
    this.drawer.open()
  }

  suma(row:OrdenTrabajo,attr:"cantidadRechazada"|"cantidadRecibida"){
    const p = row.piezas
    let suma = 0;
    p.forEach(pieza=>{
      suma += pieza[attr].reduce((sum, val) => sum + Number(val || 0), 0)
    })
    return suma
  }

 

  calcularPendientes(row:OrdenTrabajo){
    return row.totalPiezas! - this.suma(row,"cantidadRecibida") 
  }
}
