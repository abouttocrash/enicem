import { Component, inject, output } from "@angular/core"
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog"
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
  data = inject(MAT_DIALOG_DATA) as "EDIT"|"NEW";
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
  title = "Crear Proyecto"
  boton = "Crear"
  constructor(public API:APIService,private ref:MatDialogRef<NewProjectDialog>){
    if(this.data == "EDIT"){
      this.boton = "Editar"
      this.title = "Editar Proyecto"
      const copy = structuredClone(API.currentProject)
      this.user = API.currentUser
      this.form = new FormGroup({
        nombreProyecto: new FormControl(copy.name, [Validators.required]),
        claveProyecto:new FormControl(copy.noSerie,[ Validators.required]),
        designer:new FormControl(this.user.name ,[Validators.required]),
      });
    }
    else{
      this.form = new FormGroup({
        nombreProyecto: new FormControl("", [Validators.required]),
        claveProyecto:new FormControl("",[ Validators.required]),
        designer:new FormControl(this.user.name || '',[Validators.required]),
      });
    }
  }
  async ngAfterViewInit(){
    await this.API.getUsers(false)
  }

  selectUser(u:any){
   this.user = u
  }
  close(){
    this.ref.close({bool:false})
  }
  createProject(){
    this.project = {
      name: this.form.get("nombreProyecto")?.value,
      noSerie:this.form.get("claveProyecto")?.value,
      designer:this.user,
      createdBy:this.API.currentUser._id
    }
    if(this.data == "EDIT")
      return this.ref.close({bool:true,p:this.project})
    
    
    this.actionPerformed.emit(this.project)
  }
}