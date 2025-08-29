import { Component, ElementRef, inject, output, ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import { Router } from '@angular/router';
import { APIService } from '../../api.service';
import { Project } from '../Proyecto';
import { NewProjectDialog } from '../dialog-project/dialog-component';
import { DatePipe } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-projects',
  imports: [MatIconModule,MatDialogModule,MatMenuModule,DatePipe,MatFormField,MatInputModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  readonly dialog = inject(MatDialog);
  @ViewChild('folderInput') folderInput!: ElementRef<HTMLInputElement>;
  

  constructor(private router:Router,public API:APIService){}

  async ngAfterViewInit(){}

  async newProject(){
    const dialogRef = this.dialog.open(NewProjectDialog);
     dialogRef.componentInstance.actionPerformed.subscribe(async(data:Project)=>{
      const project = await this.API.createProject(data)
      dialogRef.close()
     })
  }

  

  getFolders() {
    this.folderInput.nativeElement.value = '';
    this.folderInput.nativeElement.click();
  }

  

  async onFolderSelected(event: Event) {
    const formData = new FormData();
    let files:any[] = []
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) 
        files = Array.from(input.files);
      
      files.forEach(file => formData.append('files', file, file.name));
      try{
        //TODO checar porque fallo
        //Warning: Indexing all PDF objects
        //message: 'Invalid PDF structure'
        const response = await this.API.createLog(formData)
        this.API.currentProject.logId = response.log.insertedId
        const r = await this.API.updateProject(response.log.insertedId,this.API.currentUser._id,this.API.currentProject._id!,files.length)
        this.API.currentProject.setStatus("Bitácora")
        this.API.currentProject.count = files.length
      }catch(e){
        throw e
      }
      

  }

  seeDetails(e:MouseEvent){
    e.stopPropagation()
    localStorage.setItem("project",JSON.stringify(this.API.currentProject))
    this.router.navigate(["/details"])
  }

  setItem(p:Project){
    this.API.currentProject = p;
  }

  isAddLogButtonDisabled(){
    if(!this.API.currentProject)return false
    else{
      if(this.API.currentProject.count)return true
      else return false

    }
  }

  
}


