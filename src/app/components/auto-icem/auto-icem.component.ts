import { Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
export type AutoFilter = {
  filter:string,
  options:Array<string>
}
export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();
  return opt.filter(item => item.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'auto-icem',
  imports: [MatFormFieldModule,MatAutocompleteModule,MatIconModule,MatInputModule],
  templateUrl: './auto-icem.component.html',
  styleUrl: './auto-icem.component.scss'
})
export class AutoIcemComponent {
  @ViewChild('searchInput', { read: ElementRef }) searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocomplete) autoComplete!:MatAutocomplete
  @ViewChild(MatAutocompleteTrigger) autoCompleteTrigger!: MatAutocompleteTrigger;
  keyup = output<KeyboardEvent | string>()
  placeholder = input<string>("Buscar")
  filteredFilters = input.required<AutoFilter[]>()
  filters = input.required<AutoFilter[]>()
  appareance = input<MatFormFieldAppearance>()

  clear($event:MouseEvent){
    this.autoCompleteTrigger!.closePanel()
    const inputEl = this.searchInput!.nativeElement
    this.autoCompleteTrigger?.setDisabledState(true)
    inputEl.value = '';
    inputEl.blur();
    setTimeout(() => {
       this.autoCompleteTrigger?.setDisabledState(false)
       this.keyup.emit('')
    }, );
  }

  filterGroup(value: string): AutoFilter[] {
    if (value) {
      const x = this.filters()
      .map(group => ({filter: group.filter, options: _filter(group.options, value)}))
      .filter(group => group.options.length > 0);
      return x
    }
    return this.filters()
  }

  
}
