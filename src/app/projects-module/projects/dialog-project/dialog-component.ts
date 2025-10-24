import { Component, output } from "@angular/core"
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { APIService } from "../../../api.service"
import { Proyecto } from "@shared-types/Proyecto"
import { Usuario } from "@shared-types/Usuario"

@Component({
  selector: 'dialog-project',
  templateUrl: './dialog-project.html',
  styleUrl: './dialog-project.scss',
  imports: [MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule,FormsModule,ReactiveFormsModule],
})
export class NewProjectDialog {
  form!:FormGroup
  user:Usuario = {
    name:"",
    _id:"",
    color:"#",
    short:"",
    actions:[]
  }
  project = {} as Proyecto
  actionPerformed = output<any>()
  constructor(public API:APIService,private ref:MatDialogRef<NewProjectDialog>){
    this.form = new FormGroup({
      nombreProyecto: new FormControl("", [Validators.required]),
      claveProyecto:new FormControl("",[ Validators.required]),
      designer:new FormControl(this.user.name || '',[Validators.required]),
    });
  }
  async ngAfterViewInit(){
    await this.API.getUsers(false)
  }

  selectUser(u:any){
   this.user = u
  }
  close(){
    this.ref.close()
  }
  createProject(){
    this.project = {
      name: this.form.get("nombreProyecto")?.value,
      noSerie:this.form.get("claveProyecto")?.value,
      designer:this.user,
      createdBy:this.API.currentUser._id
    }
    this.actionPerformed.emit(this.project)
  }
}