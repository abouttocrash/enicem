import { Component, output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { APIService } from "../../api.service"
import { User } from "../../users-module/User"
import { Project } from "../Proyecto"

@Component({
  selector: 'dialog-project',
  templateUrl: './dialog-project.html',
  styleUrl: './dialog-project.scss',
  imports: [MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule,FormsModule],
})
export class NewProjectDialog {
  
  user:User = {
    name:"",
    _id:""
  }
  project = new Project("","")
  actionPerformed = output<any>()
  constructor(public API:APIService){}
  async ngAfterViewInit(){
  }

  selectUser(u:User){
    this.project.setUser(u)
  }

  createProject(){
    this.project.createdBy = this.API.currentUser._id
    this.actionPerformed.emit(this.project)
  }
}