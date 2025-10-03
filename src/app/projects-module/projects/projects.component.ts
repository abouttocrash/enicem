import { Component, ElementRef, inject,ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import { Router } from '@angular/router';
import { APIService } from '../../api.service';
import { NewProjectDialog } from './dialog-project/dialog-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProjectCardComponent } from './project-card/project-card.component';
import { StorageService } from '../../storage.service';
import { BARComponent } from '../project-detail/bar/bar.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Proyecto } from '@shared-types/Proyecto';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
@Component({
  selector: 'app-projects',
  imports: [MatIconModule,MatDialogModule,MatMenuModule,ProjectCardComponent,BARComponent,
    MatSelectModule,MatFormFieldModule,FormsModule,MatSnackBarModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  readonly dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  filtro = ""
  
  constructor(private router:Router,public API:APIService,private storage:StorageService){}

  async ngAfterViewInit(){}

  async newProject(){
    const dialogRef = this.dialog.open(NewProjectDialog,
      {width:"460px",height:"520px",disableClose:true}
    );
    dialogRef.componentInstance.actionPerformed.subscribe(async(data:Proyecto)=>{
      await this.API.createProject(data)
      this._snackBar.open("Proyecto creado con éxito","✔️",{duration:1500})
      await this.API.getProjects("ABIERTO")
      dialogRef.close()
      //TODO error state?
    })
  }

  async buscarProyecto(filtro:string){
    await this.API.getProjects(this.filtro)
  }

  

 

  seeDetails(p:Proyecto){
    this.API.currentProject = p;
    this.storage.setProject(this.API.currentProject)
    this.router.navigate(["/details"])
  }

  setItem(p:Proyecto){
    this.API.currentProject = p;
  }
  
}


