import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginPage } from './pages/login/login.page';
import { MenuPage } from './pages/menu/menu.page';
import { ProjectsPage } from './pages/projects/projects.page';
import { ProjectDetailPage } from './pages/projects/project-detail.page';
import { ProjectFormPage } from './pages/projects/project-form.page';
import { ActivitiesPage } from './pages/activities/activities.page';
import { DepartmentsPage } from './pages/departments/departments.page';
import { AssignmentsPage } from './pages/assignments/assignments.page';
import { ReportsPage } from './pages/reports/reports.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'menu',
    component: MenuPage,
    canActivate: [AuthGuard]
  },
  {
    path: 'projects',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ProjectsPage
      },
      {
        path: 'create',
        component: ProjectFormPage
      },
      {
        path: 'edit/:id',
        component: ProjectFormPage
      },
      {
        path: ':id',
        component: ProjectDetailPage
      }
    ]
  },
  {
    path: 'activities',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ActivitiesPage
      }
    ]
  },
  {
    path: 'departments',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DepartmentsPage
      }
    ]
  },
  {
    path: 'assignments',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: AssignmentsPage
      }
    ]
  },
  {
    path: 'reports',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ReportsPage
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }