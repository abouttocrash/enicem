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

  clear($event:MouseEvent){
    this.autoCompleteTrigger!.closePanel()
    const inputEl = this.searchInput!.nativeElement
    this.autoCompleteTrigger?.setDisabledState(true)
    inputEl.value = '';
    inputEl.blur(); // remove focus so autocomplete won't reopen
    setTimeout(() => {
       this.autoCompleteTrigger?.setDisabledState(false)
       this.applyFilter('')
    }, );
    
    
  }

   applyFilter(event: Event | string) {
    let filterValue = ""
    if(typeof event == "string")
      filterValue = event.trim().toLowerCase();
    else
      filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.p.b.dataSource.filterPredicate = (data: any, filter: string) => {
        const f = filter.toLowerCase();
        if(data.what == undefined){
          data.what = []
        }
        const matchProveedor = data.proveedor.toLowerCase().includes(filter);
        const matchcreador = data.usuario.toLowerCase().includes(filter);
        const matchWhat = data.what.some((p: any) => p.plano?.toLowerCase().includes(filter))
        return matchWhat ||  matchcreador  || matchProveedor;
    };
    this.p.b.dataSource.filter = filterValue;
    this.p.b.filteredFilters = this._filterGroup(filterValue)
  }
  
  expandedElement: any | null;

  isExpanded(element: any) {
    return this.expandedElement === element;
  }

  private _filterGroup(value: string): AutoFilter[] {
      if (value) {
        const x = this.p.b.filters
          .map(group => ({filter: group.filter, options: _filter(group.options, value)}))
          .filter(group => group.options.length > 0);
        return x
      }
  
      return this.p.b.filters
    }

  toggle(element: any) {
    //if(element.expand)
    if(true)
    this.expandedElement = this.isExpanded(element) ? null : element;
  }
  
}


