import { Routes } from '@angular/router';
import { ProjectDetailComponent } from './projects-module/project-detail/project-detail.component';
import { ProjectsComponent } from './projects-module/projects/projects.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VistaOrdenesComponent } from './vista-ordenes/vista-ordenes.component';

export const routes: Routes = [
    {component:ProjectsComponent,path:""},
    {component:DashboardComponent,path:"dashboard"},
    {component:ProjectDetailComponent,path:"details"},
    {component:VistaOrdenesComponent,path:"ordenes"},
];
