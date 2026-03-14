import { Component } from '@angular/core';
import { APIService } from '../../api.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vista-backups',
  imports: [MatIconModule],
  templateUrl: './vista-backups.component.html',
  styleUrl: './vista-backups.component.scss'
})
export class VistaBackupsComponent {
  arr:{name:string,time:string}[] = []
  constructor(private api:APIService){

  }
  async ngAfterViewInit(){
    await this.getBackup()
  }
  
  async getBackup(){
    const r = await this.api.backup()
    this.arr = r.data
  }

  async backup(){
    await this.api.postbackup()
    await this.getBackup()
  }
}
