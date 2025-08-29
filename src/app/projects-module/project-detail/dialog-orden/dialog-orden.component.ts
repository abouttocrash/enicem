import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { APIService } from '../../../api.service';

@Component({
  selector: 'app-dialog-orden',
  imports: [MatIconModule,FormsModule,CommonModule ],
  templateUrl: './dialog-orden.component.html',
  styleUrl: './dialog-orden.component.scss'
})
export class DialogOrdenComponent {
  data = inject(MAT_DIALOG_DATA);
  @ViewChildren('photoInput') photoInputs!: QueryList<ElementRef<HTMLInputElement>>;
  constructor(private api:APIService){
    console.log(this.data)
    this.data.list.forEach((d:any)=>{
      d.piezas = this.piezasAsNumber(d.piezas)
    })
  }

  piezasAsNumber(piezas:string){
    if(/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(piezas)){
      return piezas
    }
    return ""
  }
  
  onPhotoSelected(event: Event, plano: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      plano.imagenes = files;
    }
  }

  async createOrder(){
    await this.api.uploadPiezasConImagenes(this.data.list, this.data.project._id)
  }

  getImagePreviewUrl(img: any): string{
    if (img.previewUrl) return img.previewUrl;
    img.previewUrl = (window.URL || window.webkitURL).createObjectURL(img);
    return img.previewUrl
  }
}
