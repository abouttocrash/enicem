import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Pieza } from '@shared-types/Pieza';

@Component({
  selector: 'app-dialog-salida',
  imports: [MatFormFieldModule,MatSelectModule,FormsModule],
  templateUrl: './dialog-salida.component.html',
  styleUrl: './dialog-salida.component.scss'
})
export class DialogSalidaComponent {
  data = inject<any>(MAT_DIALOG_DATA);
  revision = ""
  constructor(private dialog:MatDialogRef<DialogSalidaComponent>){}

   actualizar(bool:boolean){
    this.data.status = this.revision
    this.dialog.close({data:this.data,bool:bool})
  }
}
