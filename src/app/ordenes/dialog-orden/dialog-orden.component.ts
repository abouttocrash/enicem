import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, QueryList, signal, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { APIService } from '../../api.service';
import { User } from '../../users-module/User';
import { Pieza } from '@shared-types/Pieza';
import { ProyectoService } from '../../proyecto.service';
import moment from 'moment';
import { sum } from '../../utils/Utils';
import { Proveedor } from '@shared-types/Proveedor';
@Component({
  selector: 'app-dialog-orden',
  providers:[
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  ],
  imports: [MatIconModule, ReactiveFormsModule,FormsModule,
     CommonModule, MatInputModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatDatepickerModule, ReactiveFormsModule],
  templateUrl: './dialog-orden.component.html',
  styleUrl: './dialog-orden.component.scss'
})
export class DialogOrdenComponent {
  form!:FormGroup
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  @ViewChildren('photoInput') photoInputs!: QueryList<ElementRef<HTMLInputElement>>;
  data = inject(MAT_DIALOG_DATA) as {list:Array<Pieza>};
  folio = "-"
  proveedor!:User
  proveedorObj!:User
  todayDate:Date = new Date();
  proveedores:Proveedor[] = []
  filteredProveedores:Proveedor[] = []
  constructor(public api:APIService,private ref:MatDialogRef<DialogOrdenComponent>,private p:ProyectoService){
    this._locale.set('es');
    this._adapter.setLocale(this._locale());
    this.form = new FormGroup({
      tipo: new FormControl("", [Validators.required]),
      proveedor:new FormControl("",[ Validators.required]),
      date:new FormControl('',[Validators.required]),
      equipos:new FormControl(1)
    });
    this.data.list.forEach((d:Pieza)=>{
      d.piezas = this.piezasAsNumber(d.piezas)
      d.base = Number(d.piezas)
    })
    this.proveedores = api.proveedores
    this.filteredProveedores = structuredClone(api.proveedores)
  }

  changeEquipo(val:number){
    let current = this.form.get("equipos")!.value as number
    if(current == 1 && val == -1)
      return
    current += val
    this.form.get("equipos")?.setValue(current)
    this.data.list.forEach(p=>{
      p.cantidadInDialog = (Number(p.base) * current)
    })
  }

  

  close(){
    this.ref.close(false)
  }
  async setFolio(tipo:string){
    const r = await this.api.getFolio()
    this.folio = tipo == "Detalle"? r.data.Detalle : r.data.Maquinado
    this.filteredProveedores = this.proveedores.filter(p=>{return p.tipo == tipo || p.tipo == "Ambos"})
    if(tipo == "Detalle")
      this.data.list.forEach((d:Pieza)=>{
        d.base = sum(d.stock.map(s=>{return s.c}))
        d.cantidadInDialog = 0
      })
    else
      this.data.list.forEach((d:Pieza)=>{
        d.piezas = this.piezasAsNumber(d.piezas)
        d.base = Number(d.piezas)
        d.cantidadInDialog = d.base
      })
  }

  piezasAsNumber(piezas:string){
    if(/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(piezas)){
      return piezas
    }
    return ""
  }

  selectProveedor(p:User){
    this.proveedorObj = p
  }
  
  onPhotoSelected(event: Event, plano: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      plano.imagenes = files;
    }
  }

  async createOrder(){
    const tipo = this.form.get("tipo")!.value
    await this.p.o.createOrder(tipo,this.folio,this.data.list,
      moment(this.form.get("date")?.value!).endOf("day").toDate(),this.proveedorObj)
    
    await this.p.getAll()
    this.ref.close(true)
  }

  getImagePreviewUrl(img: any): string{
    if (img.previewUrl) return img.previewUrl;
    img.previewUrl = (window.URL || window.webkitURL).createObjectURL(img);
    return img.previewUrl
  }

  allPiezasAreFilled(){
    let valid = true
    this.data.list.forEach((p:Pieza) => {
      console.log( p.cantidadInDialog!, ">", p.base!, this.form.get("tipo")!.value ,"==", "Detalle")
      if(p.piezas == ""  ||p.cantidadInDialog ==0 || ( p.cantidadInDialog! > p.base! && this.form.get("tipo")!.value == "Detalle")){
        valid = false;
        return
      }
    });
    return valid
  }
  isNumber($event:KeyboardEvent,plano:Pieza){
    const input = $event.target as HTMLInputElement;
    let value = input.value;
    if ($event.key.length === 1) {
      value += $event.key;
    }
    // Permite números decimales (solo un punto)
    if (!/^\d*\.?\d*$/.test(value) && $event.key.length === 1) 
      $event.preventDefault();
  }

  keyup($event:KeyboardEvent,plano:Pieza){
    const input = $event.target as HTMLInputElement;
    let value = Number(input.value)
  }

  disableForm(){
    return !(this.form.valid && this.allPiezasAreFilled())
  }

  disableInput($event:KeyboardEvent){
    $event.preventDefault()
  }

  sumStock(plano:Pieza){
    return plano.stock.reduce((sum, val) => sum + Number(val.c || 0), 0)
  }
}
