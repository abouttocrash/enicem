import { Component, inject, ViewChild } from '@angular/core';
import { APIService } from '../../api.service';
import { MatIconModule } from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule} from '@angular/common';
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
import { SalidasComponent } from '../../salidas/salidas.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-project-detail',
  imports: [FormsModule,
    MatIconModule,MatCheckboxModule,FormsModule,
    MatTabsModule,CatalogoComponent,BitacoraComponent,OrdenesTrabajoComponent,
    MatMenuModule,MatSidenavModule,PanelOrdenComponent,CommonModule,SalidasComponent
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent {
  @ViewChild(PanelOrdenComponent) panel!:PanelOrdenComponent
  @ViewChild(BitacoraComponent) bitacora!:BitacoraComponent
  @ViewChild(CatalogoComponent) catalogo!:CatalogoComponent
  @ViewChild(OrdenesTrabajoComponent) ordenes!:OrdenesTrabajoComponent
  @ViewChild(SalidasComponent) salidas!:SalidasComponent
  @ViewChild(MatDrawer) drawer!:MatDrawer
  readonly dialog = inject(MatDialog);
  icon = "work"
  constructor(public api:APIService,private storage:StorageService,
    private p:ProyectoService,private router:Router,private snackBar:MatSnackBar){
    this.api.currentProject = this.storage.getProject()
  }

  async ngAfterViewInit(){
    const response = await this.api.getAll()
    this.bitacora.init(response.data.bitacora)
    this.ordenes.init(response.data.ordenes,this.drawer)
    this.catalogo.init(response.data.catalogo,this.drawer)
    this.salidas.init(response.data.salidas)
  }

  async goBack(event:MouseEvent){
    const el = document.getElementById("renew")!
    el.classList.remove('spin');         // reinicia si ya tenía clase
    // force reflow para permitir re-ejecutar la animación
    void el.offsetWidth;
    el.classList.add('spin');
    // opcional: quitar clase al terminar la animación
    const onEnd = () => { el.classList.remove('spin'); el.removeEventListener('animationend', onEnd); };
    el.addEventListener('animationend', onEnd);
    const response = await this.p.getAll()
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
        this.router.navigate([""])
        this.snackBar.open(`Proyecto ${status}`,"OK",{duration:5000})
      }
    })
  }
  
}
