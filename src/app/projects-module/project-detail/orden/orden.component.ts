import { Component } from '@angular/core';
import { APIService } from '../../../api.service';

@Component({
  selector: 'app-orden',
  imports: [],
  templateUrl: './orden.component.html',
  styleUrl: './orden.component.scss'
})
export class OrdenComponent {
  order = {
    img:[]
  } as any
  constructor(private API:APIService){
    this.order = JSON.parse(localStorage.getItem("order")!)
    this.order.img = []
    
  }
  async ngAfterViewInit(){
    
   const o = await this.API.getOrder(this.order._id)
   this.order = o.data
  }
}
