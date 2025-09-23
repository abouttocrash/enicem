import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { APIService } from '../../api.service';
import { WaveSnack } from '../../components/wave-snack/wave-snack-service';

@Component({
  selector: 'app-proveedores',
  imports: [MatFormFieldModule,MatInputModule,FormsModule,ReactiveFormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent {
  form!:FormGroup
  constructor(private dialogRef:MatDialogRef<ProveedoresComponent>,private api:APIService,private snack:WaveSnack){
    this.form = new FormGroup({
      proveedor: new FormControl("", [Validators.required]),
    });
  }

  async createProveedor(){
    this.snack.showSnack("Creando proveedor")
    await this.api.createProveedor(this.form.get("proveedor")?.value)
    await this.api.getProveedores()
     this.dialogRef.close()
    this.snack.successState("Provedor creado con éxito")
    await this.snack.timeout(800)
    this.snack.dismissSnack()
  }

  async close(){
    this.dialogRef.close()
  }
  
}
