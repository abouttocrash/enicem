
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
import { APIService } from '../../api.service';
import { ProyectoService } from '../../proyecto.service';
import { Pieza } from '@shared-types/Pieza';
import { DialogRecibirComponent } from '../dialog-recibir/dialog-recibir.component';
@Component({
  selector: 'app-panel-orden',
  imports: [MatCheckboxModule,FormsModule,MatIconModule,DatePipe,MatMenuModule],
  templateUrl: './panel-orden.component.html',
  styleUrl: './panel-orden.component.scss'
})
export class PanelOrdenComponent {
  readonly dialog = inject(MatDialog);
  
  constructor(public o:OrdenesService,private p:ProyectoService){}

  async recibir(){
    const d = this.dialog.open(DialogRecibirComponent,{
     width:"500px",
      height:"600px",
      disableClose:true,
      data:this.getPiezasSelected()
    })
    d.afterClosed().subscribe(async(result:any)=>{
      if(result){
        await this.o.aprobar(result,this.p.c.catalogId)
        await this.p.getAll()
      }
        
    })
  }

  async rechazar(){
    const d = this.dialog.open(DialogRechazoComponent,{
      width:"500px",
      height:"600px",
      disableClose:true,
      data:this.getPiezasSelected()
    })
    d.afterClosed().subscribe(async(result:any)=>{
      if(result.bool){
        await this.o.rechazar(result,this.p.c.catalogId)
        await this.p.getAll()
      }
    })

  }
  isMax(plano:Pieza){
    return Number(plano.piezas) == plano.cantidadRecibida!.reduce((sum, val) => sum + Number(val || 0), 0) + plano.cantidadRechazada!.reduce((sum, val) => sum + Number(val || 0), 0)
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
}
