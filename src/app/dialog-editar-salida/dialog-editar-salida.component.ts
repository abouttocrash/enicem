import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogSalidaComponent } from '../dialog-salida/dialog-salida.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-editar-salida',
  imports: [FormsModule],
  templateUrl: './dialog-editar-salida.component.html',
  styleUrl: './dialog-editar-salida.component.scss'
})
export class DialogEditarSalidaComponent {
  data = inject<any>(MAT_DIALOG_DATA);
  constructor(private dialog:MatDialogRef<DialogSalidaComponent>){}

   actualizar(bool:boolean){
    this.dialog.close({data:this.data,bool:bool})
  }
}
