import { Routes } from '@angular/router';
import { ProjectDetailComponent } from './projects-module/project-detail/project-detail.component';
import { ProjectsComponent } from './projects-module/projects/projects.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RechazosComponent } from './rechazos/rechazos.component';
import { VistaOrdenesComponent } from './vistas/vista-ordenes/vista-ordenes.component';
import { VistaProveedoresComponent } from './vistas/vista-proveedores/vista-proveedores.component';
import { VistaSalidasComponent } from './vistas/vista-salidas/vista-salidas.component';
import { VistaUsuariosComponent } from './vistas/vista-usuarios/vista-usuarios.component';

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
