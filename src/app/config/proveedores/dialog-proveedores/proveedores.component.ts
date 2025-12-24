import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { APIService } from '../../../api.service';
import { MatSelectModule } from '@angular/material/select';
import { Proveedor } from '@shared-types/Proveedor';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-proveedores',
  imports: [MatFormFieldModule,MatInputModule,FormsModule,ReactiveFormsModule,MatSelectModule,MatSlideToggleModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent {
  form!:FormGroup
  data = inject(MAT_DIALOG_DATA) as Proveedor;
  title = "Crear Proveedor"
  boton = "Crear"
  constructor(private dialogRef:MatDialogRef<ProveedoresComponent>,private api:APIService){
    let activo = true
    if(this.data != null){
      this.boton = "Editar"
      this.title = "Editar Proveedor"
      activo = this.data.active
    }
    this.form = new FormGroup({
      proveedor: new FormControl(this.data?.name || "", [Validators.required]),
      tipo: new FormControl(this.data?.tipo || "", [Validators.required]),
      active: new FormControl(activo, [Validators.required]),
    });
  }

  async createProveedor(){
    if(this.data)
      this.api.editProveedor(this.form,this.data._id!)
    
    else
      await this.api.createProveedor(this.form)
    this.dialogRef.close(true)
  }

  async close(){
    this.dialogRef.close(false)
  }
  
}
