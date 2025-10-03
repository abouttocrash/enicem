import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { StylesService } from './styles.service';
import { APIService } from './api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'APP Trazabilidad';
  constructor(private s:StylesService,public API:APIService){
    this.s.setMode();
   
    
  }
  
}
