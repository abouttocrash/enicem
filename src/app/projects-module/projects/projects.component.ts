import { Component, ElementRef, inject,viewChild,ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import { Router } from '@angular/router';
import { APIService } from '../../api.service';
import { NewProjectDialog } from './dialog-project/dialog-project';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProjectCardComponent } from './project-card/project-card.component';
import { StorageService } from '../../storage.service';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Proyecto } from '@shared-types/Proyecto';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { ProyectoService } from '../../proyecto.service';
@Component({
  selector: 'app-projects',
  imports: [MatIconModule,MatDialogModule,MatMenuModule,ProjectCardComponent,
    MatInputModule,
    MatSelectModule,MatFormFieldModule,FormsModule,MatSnackBarModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  readonly dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  filtro = ""
  @ViewChild('input', { read: ElementRef }) searchInput!: ElementRef<HTMLInputElement>;
  filteredProjects:Array<Proyecto> = []
  constructor(private router:Router,public API:APIService,private storage:StorageService, private p:ProyectoService){}
  
  async ngAfterViewInit(){
    const res = await this.p.getProjects("ABIERTO")
    if("success" in res)
      this.filteredProjects = res.p;
    else
      this._snackBar.open(res.error.data.error,"OK",{duration:5000})
    
  }

  async newProject(){
    const dialogRef = this.dialog.open(NewProjectDialog,
      {width:"860px",height:"620px",disableClose:true,data:"NEW"}
    );
    dialogRef.componentInstance.actionPerformed.subscribe(async(data:Proyecto)=>{
      const r = await this.p.createProject(data)
      if('name' in r){
        this._snackBar.open("✔️ Proyecto creado con éxito","OK",{duration:1500})
        const res = await this.p.getProjects("ABIERTO")
        if("success" in res)
          this.filteredProjects = res.p;
        dialogRef.close()
      }
      else
        this._snackBar.open(r.data.error,"OK",{duration:5000})
    })
  }

   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredProjects = this.API.projects.filter(p=>{
      return p.name.toLowerCase().includes(filterValue.trim().toLowerCase())
      ||p.noSerie.toLowerCase().includes(filterValue.trim().toLowerCase())
    })
  }

  async buscarProyecto(filtro:string){
    const res = await this.p.getProjects(this.filtro)
    if("success" in res){
      this.filteredProjects = res.p;
      this.searchInput.nativeElement.value = ""
    }
    
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


