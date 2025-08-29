import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { APIService } from '../../api.service';
@Component({
  selector: 'app-users-dialog',
  imports: [MatFormFieldModule,MatInputModule,FormsModule ],
  templateUrl: './users-dialog.component.html',
  styleUrl: './users-dialog.component.scss'
})
export class UsersDialogComponent {
  userName = ""
  constructor(private dialogRef:MatDialogRef<UsersDialogComponent>,private api:APIService){}

  async createUser(){
    await this.api.createUser(this.userName)
    await this.api.getUsers()
    this.dialogRef.close()
  }
}
