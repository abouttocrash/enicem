import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dialog-confirm',
  imports: [],
  templateUrl: './dialog-confirm.component.html',
  styleUrl: './dialog-confirm.component.scss'
})
export class DialogConfirmComponent {
    data = inject(MAT_DIALOG_DATA);
  constructor(private ref:MatDialogRef<DialogConfirmComponent>){}

  close(bool:boolean){
    this.ref.close(bool)
  }
}
