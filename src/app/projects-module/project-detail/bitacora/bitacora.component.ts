import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { APIService } from '../../../api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { BARComponent } from '../bar/bar.component';
import { ProyectoService } from '../../../proyecto.service';
import { Bitacora } from '@shared-types/Bitacora';

@Component({
  selector: 'bitacora',
  imports: [FormsModule,MatTableModule,MatIconModule,MatSortModule,BARComponent],
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.scss'
})
export class BitacoraComponent {
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private api:APIService,public p:ProyectoService){}

  init(data:Bitacora){
    this.p.b.init(data,this.sort)
  }
  
  expandedElement: any | null;

  isExpanded(element: any) {
    return this.expandedElement === element;
  }

  toggle(element: any) {
    if(element.expand)
    this.expandedElement = this.isExpanded(element) ? null : element;
  }
  
}


