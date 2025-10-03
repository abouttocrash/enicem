import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { APIService } from '../../api.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '@shared-types/Usuario';
import { StorageService } from '../../storage.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-user',
  imports: [MatFormFieldModule,MatSelectModule,ReactiveFormsModule],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss'
})
export class SelectUserComponent {
  form:FormGroup
  usuario!:Usuario
  constructor(public API:APIService,private storage:StorageService,public ref:MatDialogRef<SelectUserComponent>){
     this.form = new FormGroup({
      usuario: new FormControl("", [Validators.required]),
    });
  }

  selectUser(user:Usuario){
    this.usuario = user
    this.storage.setUser(user)
  }

  saveUser(){
    this.storage.setUser(this.usuario)
    this.API.currentUser = this.usuario
    this.ref.close()
  }
}
