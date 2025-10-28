import { Component, inject, output, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewsImports } from '../../utils/Utils';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import { AutoFilter, AutoIcemComponent } from '../../components/auto-icem/auto-icem.component';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';

@Component({
  selector: 'vista-generica',
  providers:[
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
  ],
  imports: [...ViewsImports,AutoIcemComponent],
  templateUrl: './vista-generica.component.html',
  styleUrl: './vista-generica.component.scss'
})
export class VistaGenericaComponent<T> {
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(AutoIcemComponent) auto!:AutoIcemComponent
  dialog = inject(MatDialog)
  dataSource!:MatTableDataSource<T>;
  displayedColumns:Array<string> = []
  keyup = output<KeyboardEvent | string>()
  filters:Array<AutoFilter>=[]
  filteredFilters:Array<AutoFilter> = []
  fecha1:Date
  fecha2:Date
  constructor(){
    this.fecha1 = moment().startOf("month").toDate()
    this.fecha2 = moment().endOf("month").toDate()
  }
  ngAfterViewInit(){
    this._locale.set('es');
    this._adapter.setLocale(this._locale());
  }
}
