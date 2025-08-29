import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dialog-rechazo',
  imports: [MatSelectModule,MatFormFieldModule,MatInputModule],
  templateUrl: './dialog-rechazo.component.html',
  styleUrl: './dialog-rechazo.component.scss'
})
export class DialogRechazoComponent {

}
