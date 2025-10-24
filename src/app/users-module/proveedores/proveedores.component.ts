import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { APIService } from '../../api.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-proveedores',
  imports: [MatFormFieldModule,MatInputModule,FormsModule,ReactiveFormsModule,MatSelectModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent {
  form!:FormGroup
  constructor(private dialogRef:MatDialogRef<ProveedoresComponent>,private api:APIService){
    this.form = new FormGroup({
      proveedor: new FormControl("", [Validators.required]),
      tipo: new FormControl("", [Validators.required]),
    });
  }

  async createProveedor(){
    await this.api.createProveedor(this.form)
    this.dialogRef.close(true)
  }

  async close(){
    this.dialogRef.close(false)
  }
  
}
