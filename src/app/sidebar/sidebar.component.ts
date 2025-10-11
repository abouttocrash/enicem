import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StylesService } from '../styles.service';
import { MatDialog } from '@angular/material/dialog';
import { UsersDialogComponent } from '../users-module/users-dialog/users-dialog.component';
import { Router } from '@angular/router';
import {CommonModule} from '@angular/common';
import { APIService } from '../api.service';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../users-module/User';
import { ProveedoresComponent } from '../users-module/proveedores/proveedores.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { SelectUserComponent } from '../users-module/select-user/select-user.component';
import { baseDialog } from '../utils/Utils';
import { StorageService } from '../storage.service';
@Component({
  selector: 'sidebar',
  imports: [MatIconModule, CommonModule,MatMenuModule,MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly dialog = inject(MatDialog);
  constructor(public s:StylesService,private router:Router,public API:APIService,private storage:StorageService){
    
  }

  async ngAfterViewInit(){
    await this.API.getUsers()
    await this.API.getProveedores()
    //TODO select 
    if(this.storage.getUser() == null){
      this.cambiarUsuario()
    }
    else{
      this.API.currentUser = this.storage.getUser()!
    }
    await this.API.getProjects("ABIERTO")
  }
  gotoProjects(){
    this.router.navigate(["/"])
  }
  goToOrdenes(){
    this.router.navigate(["ordenes"])
  }
  goToDashboard(){
    this.router.navigate(["dashboard"])
  }
  cambiarUsuario(){
    this.dialog.open(SelectUserComponent,{
      ...baseDialog
    })
  }
  newUser(){
     const dialogRef = this.dialog.open(UsersDialogComponent,{disableClose:true});
  }
  newProveedor(){
     const dialogRef = this.dialog.open(ProveedoresComponent,{disableClose:true});
  }

  

  
  
}
