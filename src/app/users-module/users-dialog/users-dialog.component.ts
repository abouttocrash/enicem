import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { APIService } from '../../api.service';
import { MatSelectModule } from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { Usuario } from '@shared-types/Usuario';
import { isNumber } from '../../utils/DialogUtils';
import { ProyectoService } from '../../proyecto.service';
@Component({
  selector: 'app-users-dialog',
  imports: [MatFormFieldModule,MatInputModule,ReactiveFormsModule,MatSelectModule,MatSlideToggleModule ],
  templateUrl: './users-dialog.component.html',
  styleUrl: './users-dialog.component.scss'
})
export class UsersDialogComponent {
  form!:FormGroup
  data = inject(MAT_DIALOG_DATA) as Usuario;
  disabled = true;
  title = "Crear Usuario"
  boton = "Crear"
  isNumber = isNumber
  
  constructor(private dialogRef:MatDialogRef<UsersDialogComponent>,public api:APIService,private p:ProyectoService){
    let activo = true
    if(this.data != null){
      this.title = "Editar Usuario"
      this.boton = "Editar"
      activo = this.data.active!
    }
    console.log(activo)
    this.form = new FormGroup({
      username: new FormControl(this.data?.name || "", [Validators.required]),
      code: new FormControl(this.data?.code || "", [Validators.required,Validators.min(4)]),
      rol: new FormControl(this.data?.rol || "", [Validators.required]),
      activo: new FormControl(activo , [Validators.required]),
    });
  
  }

 
  //TODO: Error state
  async createUser(){
    if(this.data){
      this.data.name = this.form.get("username")!.value
      this.data.code = this.form.get("code")!.value
      this.data.rol = this.form.get("rol")!.value
      this.data.active = this.form.get("activo")!.value
      this.api.editUser(this.data)
    }
    else
      await this.p.createUser(this.form)
    this.dialogRef.close(true)
  }

  close(){
    this.dialogRef.close(false)
  }
}
