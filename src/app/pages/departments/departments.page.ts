import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../interfaces/department.interface';

@Component({
  selector: 'app-departments',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/menu"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center">Departamentos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="clear">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-card *ngFor="let department of departments" class="department-card ion-margin">
          <ion-card-header>
            <ion-card-title>{{ department.name }}</ion-card-title>
            <ion-card-subtitle>Código: {{ department.code }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>            
            <ion-row class="ion-margin-top">
              <ion-col>
                <ion-button fill="clear" size="small" (click)="viewDepartment(department)">
                  <ion-icon slot="start" name="eye-outline"></ion-icon>
                  Detalhes
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-center">
                <ion-button fill="clear" size="small" color="primary" (click)="editDepartment(department)">
                  <ion-icon slot="start" name="create-outline"></ion-icon>
                  Editar
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-end">
                <ion-button fill="clear" size="small" color="danger" (click)="confirmDelete(department)">
                  <ion-icon slot="start" name="trash-outline"></ion-icon>
                  Excluir
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="departments.length === 0" class="ion-text-center ion-padding">
        <ion-icon name="business-outline" style="font-size: 48px; color: var(--ion-color-medium)"></ion-icon>
        <p>Nenhum departamento encontrado</p>
      </div>

      <ion-infinite-scroll (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button routerLink="/departments/create">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [`
    .department-card {
      border-radius: 16px;
      margin: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    ion-card-title {
      font-size: 1.2em;
      font-weight: 600;
      margin-top: 8px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class DepartmentsPage implements OnInit, OnDestroy {
  departments: Department[] = [];
  currentPage = 1;
  private departmentsUpdatedListener: any;

  constructor(
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.departmentsUpdatedListener = () => {
      this.currentPage = 1;
      this.loadDepartments();
    };
    document.addEventListener('departmentsUpdated', this.departmentsUpdatedListener);
  }

  ngOnInit() {
    this.loadDepartments();
  }

  ngOnDestroy() {
    document.removeEventListener('departmentsUpdated', this.departmentsUpdatedListener);
  }

  loadDepartments() {
    this.departmentService.getDepartments(this.currentPage).subscribe(
      (response: any) => {
        this.departments = response.data;
      }
    );
  }

  handleRefresh(event: any) {
    this.currentPage = 1;
    this.departmentService.getDepartments(this.currentPage).subscribe(
      (response: any) => {
        this.departments = response.data;
        event.target.complete();
      }
    );
  }

  async confirmDelete(department: Department) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Deseja realmente excluir o departamento "${department.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.deleteDepartment(department)
        }
      ]
    });

    await alert.present();
  }

  async deleteDepartment(department: Department) {
    try {
      await this.departmentService.deleteDepartment(department.id!).toPromise();
      this.departments = this.departments.filter(d => d.id !== department.id);

      const toast = await this.toastController.create({
        message: 'Departamento excluído com sucesso',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Erro ao excluir departamento',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  loadMore(event: any) {
    this.currentPage++;
    this.departmentService.getDepartments(this.currentPage).subscribe(
      (response: any) => {
        this.departments = [...this.departments, ...response.data];
        event.target.complete();
        if (response.meta.current_page >= response.meta.last_page) {
          event.target.disabled = true;
        }
      }
    );
  }

  viewDepartment(department: Department) {
    this.router.navigate(['/departments', department.id]);
  }

  editDepartment(department: Department) {
    this.router.navigate(['/departments/edit', department.id]);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}