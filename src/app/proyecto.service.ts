import { inject, Injectable } from '@angular/core';
import { APIService } from './api.service';
import { OrdenesService } from './ordenes/ordenes.service';
import { BitacoraService } from './bitacora.service';
import { CatalogoService } from './catalogo.service';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  o = inject(OrdenesService)
  b = inject(BitacoraService)
  c = inject(CatalogoService)
  constructor(public api:APIService ) {}

  async getAll(){
    const r = await this.api.getAll()
    this.o.init(r.data.ordenes)
    this.b.init(r.data.bitacora)
    this.c.init(r.data.catalogo)
  }
}
