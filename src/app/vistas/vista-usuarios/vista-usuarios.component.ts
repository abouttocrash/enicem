import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource} from '@angular/material/table';
import { Usuario } from '@shared-types/Usuario';
import { firstValueFrom } from 'rxjs';
import { MatSort} from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { APIService } from '../../api.service';
import { AutoIcemComponent, AutoFilter } from '../../components/auto-icem/auto-icem.component';
import { UsersDialogComponent } from '../../users-module/users-dialog/users-dialog.component';
import { ViewsImports, baseDialog } from '../../utils/Utils';


@Component({
  selector: 'app-vista-usuarios',
  imports: [AutoIcemComponent,...ViewsImports],
  templateUrl: './vista-usuarios.component.html',
  styleUrl: './vista-usuarios.component.scss'
})
export class VistaUsuariosComponent {
  dialog = inject(MatDialog)
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns = ["name","rol",'isActive', "editar"]
  dataSource!:MatTableDataSource<Usuario>;
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  filters:Array<AutoFilter>=[
    {
      filter:"Nombre",
      options:[]
    },
    {
      filter:"Rol",
      options:[]
    },
    {
      filter:"Activo",
      options:[]
    }
    
  ]
  filteredFilters:Array<AutoFilter> = []
  constructor(private api:APIService){}
    async ngAfterViewInit(){
    await this.buscar()
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
    this.dataSource.filterPredicate = (data: Usuario, filter: string) => {
        const matchName = data.name.toLowerCase().includes(filter);
        const matchTipo = data.rol!.toLowerCase().includes(filter)
        const matchActivo = data.isActive!.toLowerCase().includes(filter)
        
        return matchName || matchTipo || matchActivo
    };
    this.dataSource.filter = filterValue;
    this.filteredFilters = this.auto.filterGroup(filterValue)
  }
  async buscar(){
    await this.api.getUsers()
    this.dataSource = new MatTableDataSource(this.api.users)
    this.filters[0].options = Array.from(new Set(this.api.users.map(d=>{return d.name})))
    this.filters[1].options = Array.from(new Set(this.api.users.map(d=>{return d.rol!})))
    this.filters[2].options = Array.from(new Set(this.api.users.map(d=>{return d.isActive!})))
    this.filteredFilters = JSON.parse(JSON.stringify(this.filters))
    this.dataSource.sort = this.sort
  }
  async nuevoUsuario(){
    const dialogRef = this.dialog.open(UsersDialogComponent,{...baseDialog,disableClose:true});
    const r = await firstValueFrom(dialogRef.afterClosed())
    if(r){
      await this.buscar()
    }
  }
  async editarUsuario(usuario:Usuario){
     const dialogRef = this.dialog.open(
      UsersDialogComponent,
      {
        ...baseDialog,
        disableClose:true,
        data:structuredClone(usuario)
      });
    const r = await firstValueFrom(dialogRef.afterClosed())
    if(r){
      await this.buscar()
    }
    
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  //TODO
  isAdmin(){
    return this.api.currentUser.rol == "ADMIN"
  }
  isPoderoso(){
    return this.api.currentUser.actions?.includes("CREAR_USUARIO")
  }
}
