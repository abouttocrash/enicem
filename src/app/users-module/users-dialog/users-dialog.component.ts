import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { APIService } from '../../api.service';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-users-dialog',
  imports: [MatFormFieldModule,MatInputModule,ReactiveFormsModule,MatSelectModule ],
  templateUrl: './users-dialog.component.html',
  styleUrl: './users-dialog.component.scss'
})
export class UsersDialogComponent {
  form!:FormGroup
  constructor(private dialogRef:MatDialogRef<UsersDialogComponent>,private api:APIService){
    this.form = new FormGroup({
      username: new FormControl("", [Validators.required]),
      code: new FormControl("", [Validators.required,Validators.min(4)]),
      rol: new FormControl("", [Validators.required]),
    });
    
  }
  //TODO: Error state
  async createUser(){
    console.log(this.form.get("rol")?.value)
    await this.api.createUser(this.form.get("username")?.value,this.form.get("code")?.value,this.form.get("rol")?.value)
    await this.api.getUsers()
    
    this.dialogRef.close()
  }

  close(){
    this.dialogRef.close()
  }

  isNumber($event:KeyboardEvent){
      const input = $event.target as HTMLInputElement;
      let value = ""
      if($event.key.length === 1)
        value = input.value + $event.key;
      
      if (!/^\d*$/.test(value) && $event.key.length === 1) {
        $event.preventDefault();
      }
     
    }
}
