import { Component, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { StylesService } from './styles.service';
import { APIService } from './api.service';
import { WaveSnack } from './components/wave-snack/wave-snack-service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { User } from './users-module/User';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, CommonModule,MatMenuModule,MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'enicem';
  constructor(private s:StylesService,public API:APIService,
    private waveSnack: WaveSnack,private vcr: ViewContainerRef){
     this.s.setMode();
  }

  async ngOnInit(){
    this.waveSnack.setViewContainerRef(this.vcr);   
  }
  selectUser(user:User){
    this.API.currentUser = user
    
    this.setShort()
  }
  async ngAfterViewInit(){
    await this.API.getUsers()
    this.API.currentUser = this.API.users[0]
    this.setShort()
    await this.API.getProjects()
  }

  setShort(){
    const split = this.API.currentUser.name.split(" ")
    try{
      this.API.currentUser.short = `${split[0].charAt(0).toLocaleUpperCase()} ${split[1].charAt(0).toLocaleUpperCase()}`
    }catch(e){
      this.API.currentUser.short = `${split[0].charAt(0).toLocaleUpperCase()}`
    }
  }
}
