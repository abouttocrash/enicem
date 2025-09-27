import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { OrdenesService } from './ordenes/ordenes.service';
import { BitacoraService } from './bitacora.service';
import { CatalogoService } from './catalogo.service';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  o:OrdenesService
  b:BitacoraService
  c:CatalogoService
  constructor(private api:APIService,private or:OrdenesService,private bi:BitacoraService,private ca:CatalogoService) {
    this.o = or;
    this.b = bi;
    this.c = ca;
  }

  async getAll(){
    await this.o.getOrders()
    await this.b.getLog()
    await this.c.getCatalog()
  }
}
