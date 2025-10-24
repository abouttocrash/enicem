import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StylesService } from '../styles.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {CommonModule} from '@angular/common';
import { APIService } from '../api.service';
import { MatMenuModule } from '@angular/material/menu';
import {MatRippleModule} from '@angular/material/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import { SelectUserComponent } from '../users-module/select-user/select-user.component';
import { baseDialog } from '../utils/Utils';
import { StorageService } from '../storage.service';
@Component({
  selector: 'sidebar',
  imports: [MatIconModule, CommonModule,MatMenuModule,MatTooltipModule,MatRippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly dialog = inject(MatDialog);
  centered = true;
  constructor(public s:StylesService,private router:Router,public API:APIService,private storage:StorageService){
    
  }

   ngAfterContentInit(){
    //TODO select 
    if(this.storage.getUser() == null){
      this.cambiarUsuario()
    }
    else{
      this.API.currentUser = this.storage.getUser()!
    }
    
  }
  gotoProjects(){
    this.router.navigate(["/"])
  }
  goToOrdenes(){
    this.router.navigate(["ordenes"])
  }
  goToSalidas(){
    this.router.navigate(["salidas"])
  }
  goToDashboard(){
    this.router.navigate(["dashboard"])
  }
  goToProveedores(){
    this.router.navigate(["proveedores"])
  }
  goToRechazos(){
    this.router.navigate(["rechazos"])
  }
  goToUsuarios(){
    this.router.navigate(["usuarios"])
  }
  cambiarUsuario(){
    this.dialog.open(SelectUserComponent,{
      ...baseDialog
    })
  }
  
  
  //TODO
  isAdmin(){
    return this.API.currentUser.rol == "ADMIN"
  }
  canCreateUsuario(){
    return this.API.currentUser.actions.includes("NUEVO_USUARIO") &&
    this.API.currentUser.actions.includes("NUEVO_PROVEEDOR")
  }

  

  
  
}
