import { Component, inject, ViewChild } from '@angular/core';
import { APIService } from '../../api.service';
import { MatIconModule } from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { WaveSnack } from '../../components/wave-snack/wave-snack-service';
import { MatMenuModule } from '@angular/material/menu';
import {MatTabsModule} from '@angular/material/tabs';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { BitacoraComponent } from './bitacora/bitacora.component';
import { OrdenesTrabajoComponent } from '../../ordenes/ordenes-trabajo/ordenes-trabajo.component';
import { StorageService } from '../../storage.service';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { PanelOrdenComponent } from '../../ordenes/panel-orden/panel-orden.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../components/dialog-confirm/dialog-confirm.component';
import { ProyectoService } from '../../proyecto.service';
@Component({
  selector: 'app-project-detail',
  imports: [FormsModule,
    MatIconModule,MatCheckboxModule,FormsModule,
    MatTabsModule,CatalogoComponent,BitacoraComponent,OrdenesTrabajoComponent,
    MatMenuModule,MatSidenavModule,PanelOrdenComponent,CommonModule
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent {
  @ViewChild(PanelOrdenComponent) panel!:PanelOrdenComponent
  @ViewChild(BitacoraComponent) bitacora!:BitacoraComponent
  @ViewChild(CatalogoComponent) catalogo!:CatalogoComponent
  @ViewChild(OrdenesTrabajoComponent) ordenes!:OrdenesTrabajoComponent
  @ViewChild(MatDrawer) drawer!:MatDrawer
  readonly dialog = inject(MatDialog);
  icon = "work"
  constructor(public api:APIService,private location:Location,private snack:WaveSnack,
    private storage:StorageService,private p:ProyectoService){
    this.api.currentProject = this.storage.getProject()
  }

  async ngAfterViewInit(){
    this.snack.showSnack("Obteniendo información")
    await this.snack.timeout(1000)
    await this.bitacora.init()
    await this.ordenes.init(this.drawer)
    await this.catalogo.init(this.drawer)
    this.snack.dismissSnack()
  }

  goBack(){
    this.location.back()
  }
  
  async actualizarProyecto(status:string){
    const d = this.dialog.open(DialogConfirmComponent,{
      width:"340px",
      height:"260px",
      disableClose:false,
      data:{accion:"ACTUALIZAR PROYECTO A "+status}
    })
    d.afterClosed().subscribe(async(result:boolean)=>{
      if(result){
        await this.api.updateProjectStatus(status)
        this.api.currentProject.status = status
        await this.api.updateLog({description:"Proyecto "+status ,generalId:this.api.currentProject._id!,createdBy:this.api.currentUser._id,expand:false})
        await this.p.getAll()
      }
    })
  }
  
}
