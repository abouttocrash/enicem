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
@Component({
  selector: 'sidebar',
  imports: [MatIconModule, CommonModule,MatMenuModule,MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly dialog = inject(MatDialog);
  constructor(public s:StylesService,private router:Router,public API:APIService){

  }

  async ngAfterViewInit(){
    await this.API.getUsers()
    await this.API.getProveedores()
    //TODO select 
    this.API.currentUser = this.API.users[0]
    this.setShort()
    await this.API.getProjects("ABIERTO")
  }
  gotoProjects(){
    this.router.navigate(["/"])
  }
  newUser(){
     const dialogRef = this.dialog.open(UsersDialogComponent,{disableClose:true});
  }
  newProveedor(){
     const dialogRef = this.dialog.open(ProveedoresComponent,{disableClose:true});
  }

  selectUser(user:User){
    this.API.currentUser = user
    this.setShort()
  }

  setShort(){
    const split = this.API.currentUser.name.split(" ")
    try{
      this.API.currentUser.short = `${split[0].charAt(0).toLocaleUpperCase()} ${split[1].charAt(0).toLocaleUpperCase()}`
    }catch(e){
      this.API.currentUser.short = `${split[0].charAt(0).toLocaleUpperCase()}`
    }
  }
  
}
