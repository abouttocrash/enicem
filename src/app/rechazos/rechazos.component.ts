import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { APIService } from '../api.service';
import { ProveedoresComponent } from '../users-module/proveedores/proveedores.component';
import { ViewsImports, baseDialog } from '../utils/Utils';
import { Rechazo } from '@shared-types/Rechazo';
import { DialogRechazosComponent } from '../dialog-rechazos/dialog-rechazos.component';

@Component({
  selector: 'app-rechazos',
  imports: [...ViewsImports],
  templateUrl: './rechazos.component.html',
  styleUrl: './rechazos.component.scss'
})
export class RechazosComponent {
  @ViewChild(MatSort) sort!: MatSort;
  dialog = inject(MatDialog)
  displayedColumns = ["name","isActive","editar"]
  dataSource!:MatTableDataSource<Rechazo>;
  tipo = "Ambos"
  
  constructor(private api:APIService){}

  async ngAfterViewInit(){
    await this.buscar()
  }

  async buscar(){
    const rechazos = await this.api.getRechazos()
    this.dataSource = new MatTableDataSource(rechazos)
    this.dataSource.sort = this.sort
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

 

  

  async nuevoRechazo(){
    const dialogRef = this.dialog.open(DialogRechazosComponent,{...baseDialog,disableClose:true});
    const r = await firstValueFrom(dialogRef.afterClosed())
    if(r){
      await this.buscar()
    }
  }

  async editarRechazo(rechazo:Rechazo){
    const dialogRef = this.dialog.open(
    DialogRechazosComponent,
    {
      ...baseDialog,
      disableClose:true,
      data:structuredClone(rechazo)
    });
    const r = await firstValueFrom(dialogRef.afterClosed())
    if(r){
      await this.buscar()
    }
  
  }

  
}
