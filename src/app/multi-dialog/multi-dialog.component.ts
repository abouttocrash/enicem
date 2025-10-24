import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-multi-dialog',
  imports: [MatIconModule,MatTooltipModule],
  templateUrl: './multi-dialog.component.html',
  styleUrl: './multi-dialog.component.scss'
})
export class MultiDialogComponent {
data = inject<any[]>(MAT_DIALOG_DATA);
  constructor(private dialog:MatDialogRef<MultiDialogComponent>){
    console.log(this.data)

  }
  remove(index:number){
    this.data.splice(index,1)
  }
  actualizar(bool:boolean){
    return this.dialog.close({bool:bool,data:this.data})
  }
}
