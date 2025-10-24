import { Component, inject, signal, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { Proveedor } from '@shared-types/Proveedor';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { APIService } from '../../api.service';
import { AutoIcemComponent, AutoFilter } from '../../components/auto-icem/auto-icem.component';
import { ProveedoresComponent } from '../../users-module/proveedores/proveedores.component';
import { ViewsImports, baseDialog } from '../../utils/Utils';

@Component({
  selector: 'app-vista-proveedores',
  imports: [AutoIcemComponent,...ViewsImports],
  templateUrl: './vista-proveedores.component.html',
  styleUrl: './vista-proveedores.component.scss'
})
export class VistaProveedoresComponent {
  @ViewChild(MatSort) sort!: MatSort;
  dialog = inject(MatDialog)
  displayedColumns = ["name","tipo","editar"]
  dataSource!:MatTableDataSource<Proveedor>;
  tipo = "Ambos"
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  filters:Array<AutoFilter>=[
    {
      filter:"Tipo",
      options:[]
    },
    {
      filter:"Proveedor",
      options:[]
    }
  ]
  filteredFilters:Array<AutoFilter> = []
  constructor(private api:APIService){}

  async ngAfterViewInit(){
    await this.buscar()
  }

  async buscar(){
    await this.api.getProveedores()
    this.dataSource = new MatTableDataSource(this.api.proveedores)
    this.filters[0].options = Array.from(new Set(this.api.proveedores.map(d=>{return d.tipo})))
    this.filters[1].options = Array.from(new Set(this.api.proveedores.map(d=>{return d.name})))
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
    this.dataSource.sort = this.sort
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
    this.dataSource.filterPredicate = (data: Proveedor, filter: string) => {
        const matchName = data.name.toLowerCase().includes(filter);
        const matchTipo = data.tipo.toLowerCase().includes(filter)
        
        return matchName || matchTipo 
    };
    this.dataSource.filter = filterValue;
    this.filteredFilters = this.auto.filterGroup(filterValue)
  }

  

  async nuevoProveedor(){
    const dialogRef = this.dialog.open(ProveedoresComponent,{...baseDialog,disableClose:true});
    const r = await firstValueFrom(dialogRef.afterClosed())
    console.log(r)
    if(r){
      await this.buscar()
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
}
