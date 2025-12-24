import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import { OrdenTrabajo } from '@shared-types/OrdenTrabajo';
import { ProyectoService } from '../../proyecto.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { _filter, AutoIcemComponent } from '../../components/auto-icem/auto-icem.component';
import { CommonModule } from '@angular/common';
import { OrdenesComponent } from '../../tablas/ordenes/ordenes.component';

@Component({
  selector: 'ordenes-trabajo',
  imports: [MatIconModule,AutoIcemComponent,CommonModule,
    OrdenesComponent,
    MatSidenavModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  templateUrl: './ordenes-trabajo.component.html',
  styleUrl: './ordenes-trabajo.component.scss'
})
export class OrdenesTrabajoComponent {
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  @ViewChild(OrdenesComponent) ordenes!:OrdenesComponent
  readonly dialog = inject(MatDialog);
  displayedColumns:string[] = []
  constructor(public p:ProyectoService){}

  init(data:OrdenTrabajo[],drawer:MatDrawer){
    this.displayedColumns = this.p.o.displayedColumns.slice(0,-1)
    this.ordenes.drawer = drawer
    this.p.b.currentPieza = undefined
    this.p.o.init(data,drawer,this.ordenes.sort)
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
}
