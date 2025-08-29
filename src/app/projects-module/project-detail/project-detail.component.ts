import { Component, computed, inject, model, ViewChild } from '@angular/core';
import { APIService } from '../../api.service';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Location } from '@angular/common';
import { WaveSnack } from '../../components/wave-snack/wave-snack-service';
import { Project } from '../Proyecto';
import { MatDialog } from '@angular/material/dialog';
import { DialogOrdenComponent } from './dialog-orden/dialog-orden.component';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import { DialogRechazoComponent } from './dialog-rechazo/dialog-rechazo.component';
@Component({
  selector: 'app-project-detail',
  imports: [MatTableModule,MatSortModule,FormsModule,
    MatIconModule,MatCheckboxModule,FormsModule,
    MatFormFieldModule,MatInputModule,MatMenuModule,MatSidenavModule
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatDrawer) drawer!:MatDrawer
  arr:any[] = []
  checked = false
  orders:any[] = []
  currentPieza = {} as any
  displayedColumns: string[] = ['box','title','material','acabado','piezas','registrado','faltantes','rechazadas','rechazo','comentarios','expand'];
  dataSource!: MatTableDataSource<any>;
  project:Project
  readonly dialog = inject(MatDialog);
  constructor(private api:APIService,private location:Location,private snack:WaveSnack,
    private router:Router
  ){
    this.project = JSON.parse(localStorage.getItem("project")!)
  }

  goBack(){
    this.location.back()
  }
  async ngAfterViewInit(){
    this.snack.showSnack("Obteniendo informacion")
    await this.snack.timeout(500)
    //const r = await this.api.readProject('C:\\Users\\luisj\\Desktop\\icem\\DISEÑO MECANICO\\')
    const r = await this.api.getLog(this.project.logId!)
    const o = await this.api.getOrders(this.project._id!)
    this.orders = o.data
    this.arr = r.data.logs
    this.arr.forEach((d:any)=>{
      d.checked = false
    })
    this.dataSource = new MatTableDataSource(this.arr);
    console.log(this.dataSource.data)
    this.dataSource.sort = this.sort;
    this.snack.dismissSnack()
  }
  createOrder(){
    const selected = this.dataSource.data.slice().filter(d=>{return d.checked})
    this.dialog.open(DialogOrdenComponent,{
      data: {
        list:JSON.parse(JSON.stringify(selected)),
        project:this.project
      },
    });
  }
  partiallyComplete() {
    if(this.dataSource){
      const completed =  this.dataSource.data.some(t => t.checked) && !this.dataSource.data.every(t => t.checked)
      return completed
    }
    return false
    
  }
  updateRow(row:any){
    this.checked = this.dataSource.data.every(t => t.checked)
  }

  checkTable(){
    this.dataSource.data.forEach(r=>{
      r.checked = this.checked
    })
  }
  openOrder(order:any){
   localStorage.setItem("order",JSON.stringify(order))
    this.router.navigate(["/orden"])
  }
  toggle(row:any){
    this.currentPieza = row
    this.drawer.toggle()
  }

  dialogRechazo(){
    this.dialog.open(DialogRechazoComponent,{
      width: "200px",
      height: "400px"}
    )
  }

  
}
