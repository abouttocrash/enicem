
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
import { baseDialog, fixAcabado, pad, projectDisabled, sum } from '../../utils/Utils';
import { DialogConfirmComponent } from '../../components/dialog-confirm/dialog-confirm.component';
import { firstValueFrom } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createMilestone, What } from '@shared-types/Bitacora';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { APIService } from '../../api.service';
import { CambioFechaComponent } from '../../cambio-fecha/cambio-fecha.component';
import moment from 'moment';
export type IMG_OBJ = {
  URL:string,
  name:string,
  obj:File
}
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
  fixAcabado = fixAcabado
  pad = pad
  selectedImages: IMG_OBJ[] = [];
  constructor(public o:OrdenesService,public p:ProyectoService,private snack:MatSnackBar,
    private api:APIService
  ){}

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

  async recibirConScanner(){
    await this.recibir([])
  }

  async cambioFecha(){
    const d = this.dialog.open(CambioFechaComponent,{
      ...baseDialog
    })
    const r = await firstValueFrom(d.afterClosed())
    if(r.bool){
      await this.o.editarFechaOrder(r.body.date,r.body.razon)
      const desc = `Orden con Folio #${pad(this.o.currentOrden?.folio!,this.o.currentOrden?.tipo!)} - Cambio de fecha de ${moment(this.o.currentOrden?.dateEntrega!).locale("es").format("DD MMM YYYY")} a ${moment(r.body.date).locale("es").format("DD MMM YYYY")} Razón: ${r.body.razon}`
      this.o.currentOrden!.dateEntrega = r.body.date!
      await this.p.api.updateLog(createMilestone(desc,this.p.o.currentOrden!._id!,this.p.api.currentUser._id!,[],"",false))
      
      await this.p.getAll()
    }
  }

  async recibir(emptyArray?:Pieza[]){
    const piezasSelected = emptyArray == undefined? this.getPiezasSelected():[]
    const d = this.dialog.open(DialogRecibirComponent,{
      ...baseDialog,
      data:piezasSelected
    })
    d.afterClosed().subscribe(async(result:any)=>{
      if(result.bool){
        const p = this.api.projects.find(pr=>{return pr._id == this.o.currentOrden?.idProject!})!
        await this.o.aprobar(result,p.catalogId!)
        await this.p.getAll()
        let suma = 0
        this.o.currentOrden!.piezas.forEach(pieza=>{
          suma += sum(pieza.cantidadRecibida || [])
       })
        if(this.o.currentOrden!.totalPiezas! == suma ){
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
        const p = this.api.projects.find(pr=>{return pr._id == this.o.currentOrden?.idProject!})!
        await this.o.rechazar(result,p.catalogId!)
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
    const url = `${this.api.BASE_NO_API}/static/${idProyecto}/${actualTitle}.pdf`;
    window.open(url, '_blank');
  }

openNativeImageDialog() {
  this.imageInput.value = '';
  this.imageInput.click();
}


  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const images:Array<IMG_OBJ> = []
    if (input.files && input.files.length > 0) {
     Array.from(input.files).forEach(file=>{
        images.push({name:file.name,URL:URL.createObjectURL(file),obj:file})
      })
      this.selectedImages.push(...images)
    }
  }
  openImageTab(imgUrl: string) {
    window.open(imgUrl, '_blank');
  }
  removeImage(img: IMG_OBJ, event: MouseEvent) {
    event.preventDefault();
    this.selectedImages = this.selectedImages.filter(i => i.name !== img.name);
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
      
      const formData = new FormData();
     this.selectedImages.forEach(file => formData.append('imagenes', file.obj, file.name));
      formData.append('projectId', this.p.api.currentProject._id!);
      formData.append('ordenId',this.p.o.currentOrden!._id)
      await this.p.o.uploadImagenes(formData)
      const what:What[] = []
      this.selectedImages.forEach(f=>{
        let w:What = {
        cantidad:1,
        plano:f.name,
        material:"-",
        acabado:"-"
        }
        what.push(w)
      })
      const desc = `${this.selectedImages.length} Imágenes agregadas a la orden ${this.p.o.currentOrden!.tipo} con folio ${this.p.o.currentOrden!.folio}`
      await this.p.api.updateLog(createMilestone(desc,this.p.o.currentOrden!._id!,this.p.api.currentUser._id!,what,"",false))
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
    return `Piezas (${this.o.currentOrden!.totalPiezas!})`
  }

  async getPDF(){
    const r = await this.api.POST<any>("pdf/orden",{orden:this.o.currentOrden})
    window.open(r.data.path, '_blank');
  }
}
