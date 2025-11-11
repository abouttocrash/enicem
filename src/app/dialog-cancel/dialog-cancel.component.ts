import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-cancel',
  imports: [MatFormFieldModule,MatInputModule,FormsModule],
  templateUrl: './dialog-cancel.component.html',
  styleUrl: './dialog-cancel.component.scss'
})
export class DialogCancelComponent {
  razon = ""
  constructor(private dialogRef:MatDialogRef<DialogCancelComponent>){}
  close(bool:boolean){
    this.dialogRef.close({bool:bool,razon:this.razon})
  }
}
