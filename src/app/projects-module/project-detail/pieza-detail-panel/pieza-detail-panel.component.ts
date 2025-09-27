import { Component, inject, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRechazoComponent } from '../../../ordenes/dialog-rechazo/dialog-rechazo.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'pieza-detail-panel',
  imports: [FormsModule],
  templateUrl: './pieza-detail-panel.component.html',
  styleUrl: './pieza-detail-panel.component.scss'
})
export class PiezaDetailPanelComponent {
  dialog = inject(MatDialog)
  guardarClicked = output<any>()
  currentPieza = model<any>()
  pieza:any

  ngAfterContentInit(){
  }

  guardar(){
    this.guardarClicked.emit(this.pieza)
  }

  dialogRechazo(){
    const dialog = this.dialog.open(DialogRechazoComponent,{
      width: "400px",
      height: "500px"}
    )
    dialog.afterClosed().subscribe(data=>{
      this.pieza.rechazadas = data.cantidad
      this.pieza.rechazo = data.razon
    })
  }
}
