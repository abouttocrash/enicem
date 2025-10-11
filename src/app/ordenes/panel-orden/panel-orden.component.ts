
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogRechazoComponent } from '../dialog-rechazo/dialog-rechazo.component';
import { DatePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { OrdenesService } from '../ordenes.service';
import { StatusOrden } from '@shared-types/OrdenTrabajo';
import { ProyectoService } from '../../proyecto.service';
import { Pieza } from '@shared-types/Pieza';
import { DialogRecibirComponent } from '../dialog-recibir/dialog-recibir.component';
import { baseDialog, projectDisabled, sum } from '../../utils/Utils';
import { DialogConfirmComponent } from '../../components/dialog-confirm/dialog-confirm.component';
import { firstValueFrom } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createMilestone, What } from '@shared-types/Bitacora';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
@Component({
  selector: 'app-panel-orden',
  imports: [MatCheckboxModule,FormsModule,MatIconModule,DatePipe,
    MatMenuModule,MatTooltipModule,MatSnackBarModule,MatTabsModule],
  templateUrl: './panel-orden.component.html',
  styleUrl: './panel-orden.component.scss'
})
export class PanelOrdenComponent {
  readonly dialog = inject(MatDialog);
  projectDisabled = projectDisabled
  imageInput!: HTMLInputElement;
  selectedImages: string[] = [];
  constructor(public o:OrdenesService,private p:ProyectoService,private snack:MatSnackBar){}

  ngOnInit() {
  // Crea el input solo una vez
    this.imageInput = document.createElement('input');
    this.imageInput.type = 'file';
    this.imageInput.accept = 'image/*';
    this.imageInput.multiple = true;
    this.imageInput.style.display = 'none';
    this.imageInput.addEventListener('change', (event: Event) => this.onImagesSelected(event));
    document.body.appendChild(this.imageInput);
  }
  async recibir(){
    const d = this.dialog.open(DialogRecibirComponent,{
      ...baseDialog,
      data:this.getPiezasSelected()
    })
    d.afterClosed().subscribe(async(result:any)=>{
      if(result.bool){
        await this.o.aprobar(result,this.p.api.currentProject.catalogId!)
        await this.p.getAll()
        let suma = 0
        this.o.currentOrden.piezas.forEach(pieza=>{
          suma += sum(pieza.cantidadRecibida || [])
       })
        if(this.o.currentOrden.totalPiezas! == suma ){
          this.actualizarStatus("CERRADA")
          this.snack.open("Orden cerrada","OK",{duration:2000})
        }
      }
        
    })
  }

  async rechazar(){
    const d = this.dialog.open(DialogRechazoComponent,{
      ...baseDialog,
      data:this.getPiezasSelected()
    })
    d.afterClosed().subscribe(async(result:any)=>{
      if(result.bool){
        await this.o.rechazar(result,this.p.api.currentProject.catalogId!)
        await this.p.getAll()
        
      }
    })

  }
  isMax(plano:Pieza){
    return Number(plano.piezas) == plano.cantidadRecibida!.reduce((sum, val) => sum + Number(val || 0), 0) 
  }

  
  suma(v:Array<number>){
    return v!.reduce((sum, val) => sum + Number(val || 0), 0)
  }

  

  async actualizarStatus(status:StatusOrden){
    await this.o.actualizarStatus(status)
    await this.p.getAll()

  }
  getPiezasSelected(){
    const piezasSelected = this.o.piezasEnPanel.filter(p=>{return p.checked && !this.isMax(p)})
    
    
     return piezasSelected
  }
  piezasSelected(){
    return this.o.piezasEnPanel.find(p=>{return p.checked && !this.isMax(p)}) ?false:true
  }
  toggle(row:Pieza){
    const idProyecto = this.p.api.currentProject._id!
    const actualTitle = row.title.replace("(ESPEJO)","").trim()
    const url = `http://localhost:3000/static/${idProyecto}/${actualTitle}.pdf`;
    window.open(url, '_blank');
  }

openNativeImageDialog() {
  this.imageInput.value = '';
  this.imageInput.click();
}

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImages.push(... Array.from(input.files).map(file =>URL.createObjectURL(file)))
    }
  }
  openImageTab(imgUrl: string) {
    window.open(imgUrl, '_blank');
  }
  removeImage(img: string, event: MouseEvent) {
    event.preventDefault();
    this.selectedImages = this.selectedImages.filter(i => i !== img);
  }
  async guardarImagenes(){
    const d = this.dialog.open(DialogConfirmComponent,{
      width:"340px",
      height:"260px",
      disableClose:false,
      data:{accion:"GUARDAR NUEVAS IMÁGENES "+this.selectedImages.length}
    })
    const r = await firstValueFrom(d.afterClosed())
    if(r){
      const files = Array.from(this.imageInput.files ?? []);
      const formData = new FormData();
      files.forEach(file => formData.append('imagenes', file, file.name));
      formData.append('projectId', this.p.api.currentProject._id!);
      formData.append('ordenId',this.p.o.currentOrden._id)
      await this.p.api.uploadImagenes(formData)
      const what:What[] = []
      files.forEach(f=>{
        let w:What = {
        cantidad:1,
        plano:f.name,
        material:"-",
        acabado:"-"
        }
        what.push(w)
      })
      const desc = `${files.length} Imágenes agregadas a la orden ${this.p.o.currentOrden.tipo} con folio ${this.p.o.currentOrden.folio}`
      await this.p.api.updateLog(createMilestone(desc,this.p.o.currentOrden._id!,this.p.api.currentUser._id!,what,"",false))
      await this.o.getImages()
      await this.p.getAll()
      // Opcional: limpiar imágenes seleccionadas
      this.selectedImages = [];
    }
  }

  getImagenLabel(){
    return `Imágenes (${this.o.images.length})`
  }
  getPiezasLabel(){
    return `Piezas (${this.o.currentOrden.totalPiezas!})`
  }
}
