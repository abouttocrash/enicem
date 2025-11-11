import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogoService } from '../catalogo.service';
import { Pieza } from '@shared-types/Pieza.js';
import { APIService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpParams } from '@angular/common/http';
import { ICEMDR } from '@shared-types/ICEMR';
@Component({
  selector: 'app-multi-dialog',
  imports: [MatIconModule,MatTooltipModule,MatRippleModule],
  templateUrl: './multi-dialog.component.html',
  styleUrl: './multi-dialog.component.scss'
})
export class MultiDialogComponent {
  @ViewChild('folderInput2') folderInput!: ElementRef<HTMLInputElement>;
  isVerified = false
  isValid = false;
  data:any[] = []
  textoBoton = "Agregar Planos"
  sesion = 0
  inj = inject<{action:"EDITAR"|"AGREGAR",planos:Array<Pieza>}>(MAT_DIALOG_DATA);
  title = "Crear Bitácora"
  button = "Crear"
  verifying = false
  constructor(
    private dialog:MatDialogRef<MultiDialogComponent>,
    private c:CatalogoService,
    private snackbar:MatSnackBar,
    private api:APIService){
    this.sesion = Date.now()
    if(this.inj.action == "EDITAR"){
      this.title = "Agregar planos a bitácora"
      this.button = "Agregar"
    }
    
  }
  ngAfterViewInit(){
    
  }

  agregarPlanos(){
    this.folderInput.nativeElement.value = '';
    this.folderInput.nativeElement.click();
  }
  async remove(index:number,plano:any){
    this.data.splice(index,1)
    await this.c.removePlano(plano.name)
  }

  async clearUploads(){
    let httpParams = new HttpParams().set("projectId",this.api.currentProject._id!)
    try{
      const r = await this.api.DELETE<ICEMDR<Pieza>>("catalog/clear",httpParams)
      return r
    }
    catch(e){
      return false
    }
  }
  async sleep(time:number){
     await new Promise(resolve => setTimeout(resolve, time));
  }
  disableValidate(){
    return this.data.length == 0 || this.verifying == true
  }
  async verificarPlanos(){
    this.isVerified = false
    this.isValid = false
    this.verifying = true
    let ref = this.snackbar.open("Validando planos...","Cancelar")
    ref.onAction().subscribe(()=>{
      this.actualizar(false)
    })
  
    const formData = new FormData();
    formData.append("projectId",this.api.currentProject._id!)
    this.data.forEach(file => {
      
    formData.append('files', file, file.name)});
    console.log(formData)
    const response = await this.c.verificarPlanos(formData)
    this.snackbar.dismiss()
   
    this.isVerified = true
    this.verifying = false
    let map:any[] = []
    let invalid = 0
    if(response instanceof Array){
      response.forEach((pieza:Pieza)=>{
        map = this.data.map(p=>{return p.name.replace(".pdf","")})
        const index = map.indexOf(pieza.title)
        if(index > -1){
          this.data[index].material = pieza.material
          this.data[index].acabado = pieza.acabado
          this.data[index].piezas = pieza.piezas
        }
        try{
          if(this.data[index].material == null) invalid += 1;
        
        }catch(e){
          invalid += 1;
        }
        
      })
      this.data.forEach(p=>{
        if(p.material == "")
          p.material = null
      })
      this.snackbar.dismiss()
      if(invalid > 0)
        this.snackbar.open(`${invalid} planos con error`,"OK",{duration:4000})
      else{
        this.isValid = true
        this.snackbar.open(`Todos los planos son válidos`,"OK",{duration:4000})
        
      }
    }
  }

  async onFolderSelected(event: Event) {
    let files:any[] = []
    let dup = 0
    let noDup = 0
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) 
      files = Array.from(input.files);
    files.forEach(f=>{
      f.material = ""
    })
    files.forEach(f=>{
      let found2:Pieza|undefined = {} as Pieza
      let found:Pieza|undefined = {} as Pieza
      if(this.inj.action == "EDITAR"){
        found = this.data.find(d=>{return d.name == f.name})
        let x = this.inj.planos.find(p=>{return p.title == f.name.replace(".pdf","")})
        found2 = x
      }
      if(this.inj.action == "AGREGAR"){
        found = this.data.find(d=>{return d.name == f.name})
        found2 = undefined
      }
      if(!found && !found2){
        this.data.push(f)
        noDup += 1
      }
      else
        dup += 1
    })
    if(dup == 0)
    this.snackbar.open(`${noDup} Planos agregados`,"OK",{duration:1000})
    else
    this.snackbar.open(`${noDup} Planos agregados, ${dup} planos duplicados ignorados`,"OK",{duration:2000})
    console.log(this.data)
  }

  toggle(row:any){
    const url = `${this.api.BASE_NO_API}/static/${this.api.currentProject._id!}/${row.name}`;
    window.open(url, '_blank');
  }
  actualizar(bool:boolean){
    if(!bool){
    const r = this.clearUploads()

    }
    return this.dialog.close({bool:bool,data:this.data})
  }

  getTextoBoton(){
    if(this.data.length > 0) return "Agregar más planos"
    return "Agregar Planos"
  }
}
