import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StylesService } from '../styles.service';
import { MatDialog } from '@angular/material/dialog';
import { UsersDialogComponent } from '../users-module/users-dialog/users-dialog.component';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
@Component({
  selector: 'sidebar',
  imports: [MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly dialog = inject(MatDialog);
  constructor(public s:StylesService,private router:Router,private l:Location){

  }
  gotoProjects(){
    this.router.navigate(["/"])
  }
  newUser(){
     const dialogRef = this.dialog.open(UsersDialogComponent);
  }
  
}
