import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogOrdenComponent } from '../dialog-orden/dialog-orden.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BARComponent } from '../../projects-module/project-detail/bar/bar.component';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import { PanelOrdenComponent } from '../panel-orden/panel-orden.component';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo';
import { OrdenesService } from '../ordenes.service';
import { ProyectoService } from '../../proyecto.service';
@Component({
  selector: 'ordenes-trabajo',
  imports: [MatIconModule,MatTableModule,MatSortModule,BARComponent,MatSidenavModule],
  templateUrl: './ordenes-trabajo.component.html',
  styleUrl: './ordenes-trabajo.component.scss'
})
export class OrdenesTrabajoComponent {
  readonly dialog = inject(MatDialog);
  @ViewChild(MatSort) sort!: MatSort;
  
  
  drawer!:MatDrawer
  constructor(public p:ProyectoService){}

  async init(drawer:MatDrawer){
    this.drawer = drawer
    const r = await this.p.o.init(this.sort)
    
  }
  createOrder(checked:Array<any>){
    //const selected = this.dataSource.data.slice().filter(d=>{return d.checked})
    const dialog = this.dialog.open(DialogOrdenComponent,{
      data: {
        list:JSON.parse(JSON.stringify(checked))
      },
    });
    
  }

 

  async recibirPiezas(element:OrdenTrabajo){
    this.p.o.currentOrden = await this.p.o.getOrder(element._id)
    this.p.o.piezasEnPanel = JSON.parse(JSON.stringify(this.p.o.currentOrden.piezas.slice())) || []
    console.log(this.p.o.piezasEnPanel)
    this.drawer.open()
  }
}
