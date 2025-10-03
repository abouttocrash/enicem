import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogOrdenComponent } from '../dialog-orden/dialog-orden.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import { PanelOrdenComponent } from '../panel-orden/panel-orden.component';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo';
import { ProyectoService } from '../../proyecto.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'ordenes-trabajo',
  imports: [MatIconModule,MatTableModule,MatSortModule,MatSidenavModule,MatFormFieldModule,MatInputModule],
  templateUrl: './ordenes-trabajo.component.html',
  styleUrl: './ordenes-trabajo.component.scss'
})
export class OrdenesTrabajoComponent {
  readonly dialog = inject(MatDialog);
  @ViewChild(MatSort) sort!: MatSort;
  
  
  drawer!:MatDrawer
  constructor(public p:ProyectoService){}

  init(data:OrdenTrabajo[],drawer:MatDrawer){
    this.drawer = drawer
    const r = this.p.o.init(data,this.sort)
    
  }
  createOrder(checked:Array<any>){
    //const selected = this.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(DialogOrdenComponent,{
      data: {
        list:JSON.parse(JSON.stringify(checked))
      },
    });
    
  }

 applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.p.o.dataSource.filterPredicate = (data: OrdenTrabajo, filter: string) => {
        // Filtra por cualquier campo relevante
        const matchOrden = data.status.toLowerCase().includes(filter);
        // Filtra también por el título de cada pieza
        const matchPieza = Array.isArray(data.piezas)
            ? data.piezas.some((p: any) => p.title?.toLowerCase().includes(filter))
            : false;
        return matchOrden || matchPieza;
    };
    this.p.o.dataSource.filter = filterValue;
}

  async recibirPiezas(element:OrdenTrabajo){
    this.p.o.currentOrden = await this.p.o.getOrder(element._id)
    this.p.o.piezasEnPanel = JSON.parse(JSON.stringify(this.p.o.currentOrden.piezas.slice())) || []
    console.log(this.p.o.piezasEnPanel)
    this.drawer.open()
  }
}
