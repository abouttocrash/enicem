import { Routes } from '@angular/router';
import { ProjectDetailComponent } from './projects-module/project-detail/project-detail.component';
import { ProjectsComponent } from './projects-module/projects/projects.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VistaOrdenesComponent } from './vista-ordenes/vista-ordenes.component';
import { VistaSalidasComponent } from './vista-salidas/vista-salidas.component';
import { VistaProveedoresComponent } from './vista-proveedores/vista-proveedores.component';
import { VistaUsuariosComponent } from './vista-usuarios/vista-usuarios.component';
import { RechazosComponent } from './rechazos/rechazos.component';

export const routes: Routes = [
    {component:ProjectsComponent,path:""},
    {component:DashboardComponent,path:"dashboard"},
    {component:ProjectDetailComponent,path:"details"},
    {component:VistaOrdenesComponent,path:"ordenes"},
    {component:VistaSalidasComponent,path:"salidas"},
    {component:VistaProveedoresComponent,path:"proveedores"},
    {component:VistaUsuariosComponent,path:"usuarios"},
    {component:RechazosComponent,path:"rechazos"},
];
