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
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Proyecto } from '@shared-types/Proyecto';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { AutoFilter, AutoIcemComponent } from '../../components/auto-icem/auto-icem.component';
@Component({
  selector: 'app-projects',
  imports: [MatIconModule,MatDialogModule,MatMenuModule,ProjectCardComponent,AutoIcemComponent,
    MatSelectModule,MatFormFieldModule,FormsModule,MatSnackBarModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  readonly dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  filtro = ""
  filters:Array<AutoFilter>=[
    {
      filter:"Status",
      options:[]
    },
    {
      filter:"Nombre",
      options:[]
    },
    {
      filter:"Diseñador",
      options:[]
    },

  ]
  filteredFilters:Array<AutoFilter> = []
  constructor(private router:Router,public API:APIService,private storage:StorageService){}
  setupFilters(proyecto:Proyecto[]){
    this.filters[0].options = Array.from(new Set(proyecto.map(d=>{return d.status || ""}))).filter(m=>{return m != ""})
    this.filters[1].options = Array.from(new Set(proyecto.map(d=>{return d.name})))
    this.filters[2].options = Array.from(new Set(proyecto.map(d=>{return d.designer!.name})))
  }
  async ngAfterViewInit(){
    const p = await this.API.getProjects("ABIERTO")
    this.setupFilters(p)
  }

  async newProject(){
    const dialogRef = this.dialog.open(NewProjectDialog,
      {width:"460px",height:"520px",disableClose:true}
    );
    dialogRef.componentInstance.actionPerformed.subscribe(async(data:Proyecto)=>{
      await this.API.createProject(data)
      this._snackBar.open("✔️ Proyecto creado con éxito","OK",{duration:1500})
      const  p = await this.API.getProjects("ABIERTO")
      this.setupFilters(p)
      dialogRef.close()
      //TODO error state?
    })
  }

  applyFilter(event: Event | string) {
      // let filterValue = ""
      // if (event instanceof KeyboardEvent) {
      //   const k = event.key;
      //   if (/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/i.test(k)) {
      //     return;
      //   }
      // }
      // if(typeof event == "string")
      //   filterValue = event.trim().toLowerCase();
      // else
      //   filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      // this.dataSource.filterPredicate = (data: Proveedor, filter: string) => {
      //     const matchName = data.name.toLowerCase().includes(filter);
      //     const matchTipo = data.tipo.toLowerCase().includes(filter)
          
      //     return matchName || matchTipo 
      // };
      // this.dataSource.filter = filterValue;
      // console.log(filterValue)
      // this.filteredFilters = this.auto.filterGroup(filterValue)
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


