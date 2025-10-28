import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Rechazo } from '@shared-types/Rechazo';
import { APIService } from '../api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-dialog-rechazos',
  imports: [MatFormFieldModule,MatInputModule,MatSlideToggle,ReactiveFormsModule],
  templateUrl: './dialog-rechazos.component.html',
  styleUrl: './dialog-rechazos.component.scss'
})
export class DialogRechazosComponent {
  form!:FormGroup
  data = inject(MAT_DIALOG_DATA) as Rechazo;
  disabled = true;
  title = "Crear Rechazo"
  constructor(private dialogRef:MatDialogRef<DialogRechazosComponent>,public api:APIService){
    let activo = true
    if(this.data != null){
      this.title = "Editar Rechazo"
      activo = this.data.active
    }
      this.form = new FormGroup({
        name: new FormControl(this.data?.name || "", [Validators.required]),
        active: new FormControl(activo),
      });

    
    
  }
  //TODO: Error state
  async createRechazo(){
    if(this.data){
      this.data.name = this.form.get("name")!.value
      this.data.active = this.form.get("active")!.value
      this.api.editRechazo(this.data)
    }
    else
      await this.api.createRechazo(this.form)
    this.dialogRef.close(true)
  }

  close(){
    this.dialogRef.close(false)
  }
}
