import { Routes } from '@angular/router';
import { ProjectDetailComponent } from './projects-module/project-detail/project-detail.component';
import { ProjectsComponent } from './projects-module/projects/projects.component';
import { OrdenComponent } from './projects-module/project-detail/orden/orden.component';

export const routes: Routes = [
    {component:ProjectsComponent,path:""},
    {component:ProjectDetailComponent,path:"details"},
    {component:OrdenComponent,path:"orden"},
];
