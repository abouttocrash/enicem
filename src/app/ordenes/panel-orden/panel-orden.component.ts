
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
import { baseDialog, projectDisabled } from '../../utils/Utils';
import { DialogConfirmComponent } from '../../components/dialog-confirm/dialog-confirm.component';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-panel-orden',
  imports: [MatCheckboxModule,FormsModule,MatIconModule,DatePipe,MatMenuModule],
  templateUrl: './panel-orden.component.html',
  styleUrl: './panel-orden.component.scss'
})
export class PanelOrdenComponent {
  readonly dialog = inject(MatDialog);
  projectDisabled = projectDisabled
  constructor(public o:OrdenesService,private p:ProyectoService){}

  async recibir(){
    
    const d = this.dialog.open(DialogRecibirComponent,{
      ...baseDialog,
      data:this.getPiezasSelected()
    })
    d.afterClosed().subscribe(async(result:any)=>{
      if(result.bool){
        await this.o.aprobar(result,this.p.api.currentProject.catalogId!)
        await this.p.getAll()
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
    return Number(plano.piezas) == plano.cantidadRecibida!.reduce((sum, val) => sum + Number(val || 0), 0) + plano.cantidadRechazada!.reduce((sum, val) => sum + Number(val || 0), 0)
  }

  
  suma(v:Array<number>){
    return v!.reduce((sum, val) => sum + Number(val || 0), 0)
  }

  async actualizarOrden(status:string){
    const t = status == "CANCELADA"? "CANCELAR ORDEN": "CERRAR ORDEN"
    const d = this.dialog.open(DialogConfirmComponent,{
      width:"340px",
      height:"260px",
      disableClose:false,
      data:{accion:t}
    })
    const r = await firstValueFrom(d.afterClosed())
    return r
  }

  async actualizarStatus(status:StatusOrden){
    const canDo = await this.actualizarOrden(`${status}`)
    if(canDo){
      await this.o.actualizarStatus(status)
      await this.p.getAll()
    }

  }
  getPiezasSelected(){
    const piezasSelected = this.o.piezasEnPanel.filter(p=>{return p.checked && !this.isMax(p)})
    
    
     return piezasSelected
  }
  piezasSelected(){
    return this.o.piezasEnPanel.find(p=>{return p.checked && !this.isMax(p)}) ?false:true
  }
}
