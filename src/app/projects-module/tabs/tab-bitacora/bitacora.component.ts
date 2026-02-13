import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { APIService } from '../../../api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ProyectoService } from '../../../proyecto.service';
import { Bitacora, What } from '@shared-types/Bitacora';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { _filter, AutoFilter } from '../../../components/auto-icem/auto-icem.component';

@Component({
  selector: 'bitacora',
  imports: [FormsModule,MatTableModule,
    MatIconModule,MatAutocompleteModule,MatInputModule,
    MatSortModule,MatFormFieldModule],
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.scss'
})
export class BitacoraComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput', { read: ElementRef }) searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocomplete) autoComplete!:MatAutocomplete
  @ViewChild(MatAutocompleteTrigger) autoCompleteTrigger!: MatAutocompleteTrigger;
  constructor(private api:APIService,public p:ProyectoService){}

  init(data:Bitacora){
    this.p.b.init(data,this.sort)
  }

  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.p.b.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  expandedElement: any | null;

  isExpanded(element: any) {
    return this.expandedElement === element;
  }

  toggle(element: any) {
    //if(element.expand)
    if(true)
    this.expandedElement = this.isExpanded(element) ? null : element;
  }
  
}


