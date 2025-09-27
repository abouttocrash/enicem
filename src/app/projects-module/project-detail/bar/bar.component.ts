import { Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'bar',
  imports: [MatFormFieldModule,MatInputModule,MatIconModule],
  templateUrl: './bar.component.html',
  styleUrl: './bar.component.scss'
})
export class BARComponent {
  placeholder = input.required<string>()
  bar = input<boolean>(true)
}
