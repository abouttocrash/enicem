import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { APIService } from '../../api.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '@shared-types/Usuario';
import { StorageService } from '../../storage.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { isNumber } from '../../utils/DialogUtils';

@Component({
  selector: 'app-select-user',
  imports: [MatFormFieldModule,MatSelectModule,ReactiveFormsModule,MatInputModule],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss'
})
export class SelectUserComponent {
  form:FormGroup
  usuario!:Usuario
  isNumber = isNumber
  constructor(public API:APIService,private storage:StorageService,public ref:MatDialogRef<SelectUserComponent>){
     this.form = new FormGroup({
      usuario: new FormControl("", [Validators.required]),
      code: new FormControl("", [Validators.required,Validators.min(4)])
    });
  }
  async ngAfterViewInit(){
    const getAdmin = this.storage.getUser() == null
    await this.API.getUsers(getAdmin)
  }

  async selectUser(user:Usuario){
    
    this.usuario = user
  }

  saveUser(){
    if(this.form.get("code")?.value == this.usuario.code){
      this.storage.setUser(this.usuario)
      this.API.currentUser = this.usuario
      this.ref.close()
    }
    else this.form.get('code')?.setValue("")
    
  }
 

}
