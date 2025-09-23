import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { APIService } from '../../api.service';
import { WaveSnack } from '../../components/wave-snack/wave-snack-service';
@Component({
  selector: 'app-users-dialog',
  imports: [MatFormFieldModule,MatInputModule,ReactiveFormsModule ],
  templateUrl: './users-dialog.component.html',
  styleUrl: './users-dialog.component.scss'
})
export class UsersDialogComponent {
  form!:FormGroup
  constructor(private dialogRef:MatDialogRef<UsersDialogComponent>,private api:APIService,private snack:WaveSnack){
    this.form = new FormGroup({
      username: new FormControl("", [Validators.required]),
    });
    
  }
  //TODO: Error state
  async createUser(){
    this.snack.showSnack("Creando usuario")
    await this.api.createUser(this.form.get("username")?.value)
    await this.api.getUsers()
    
    this.dialogRef.close()
    this.snack.successState("Usuario creado con éxito")
    await this.snack.timeout(800)
    this.snack.dismissSnack()
  }

  close(){
    this.dialogRef.close()
  }
}
