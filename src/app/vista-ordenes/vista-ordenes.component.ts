import { Component } from '@angular/core';
import { OrdenesService } from '../ordenes/ordenes.service';

@Component({
  selector: 'app-vista-ordenes',
  imports: [],
  templateUrl: './vista-ordenes.component.html',
  styleUrl: './vista-ordenes.component.scss'
})
export class VistaOrdenesComponent {

  constructor(public o:OrdenesService){

  }
  ngAfterViewInit(){
    this.o.actualizarStatus
  }
}
