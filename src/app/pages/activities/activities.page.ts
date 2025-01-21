import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ActivityService } from '../../services/activity.service';
import { Activity } from '../../interfaces/activity.interface';

@Component({
  selector: 'app-activities',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/menu"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center">Atividades</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="clear">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment [(ngModel)]="selectedStatus" (ionChange)="filterActivities()">
          <ion-segment-button value="all">
            <ion-label>Todas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="in_progress">
            <ion-label>Em Andamento</ion-label>
          </ion-segment-button>
          <ion-segment-button value="completed">
            <ion-label>Concluídas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="pending">
            <ion-label>Pendente</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-card *ngFor="let activity of filteredActivities" class="activity-card ion-margin">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-chip [color]="getStatusColor(activity.status.name)" outline>
                <ion-label>{{ activity.status.name }}</ion-label>
              </ion-chip>
              <ion-chip color="primary" outline>
                <ion-label>{{ activity.project.title }}</ion-label>
              </ion-chip>
            </ion-card-subtitle>
            <ion-card-title>{{ activity.name }}</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <p class="ion-margin-bottom"><b>Descrição da Atividade: </b>{{ activity.description }}</p>
            
            <ion-row class="ion-align-items-center">
              <ion-col size="6">
                <ion-text color="medium">
                  <small>
                    <ion-icon name="calendar-outline"></ion-icon>
                    {{ activity.due_date | date:'shortDate' }}
                  </small>
                </ion-text>
              </ion-col>
              <ion-col size="6" class="ion-text-end">
                <ion-text color="medium">
                  <small>
                    <ion-icon name="flag-outline"></ion-icon>
                    {{ activity.due_date | date:'shortDate' }}
                  </small>
                </ion-text>
              </ion-col>
            </ion-row>

            <ion-row class="ion-margin-top">
              <ion-col>
                <ion-button fill="clear" size="small" (click)="viewActivity(activity)">
                  <ion-icon slot="start" name="eye-outline"></ion-icon>
                  Detalhes
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-center">
                <ion-button fill="clear" size="small" color="primary" (click)="editActivity(activity)">
                  <ion-icon slot="start" name="create-outline"></ion-icon>
                  Editar
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-end">
                <ion-button fill="clear" size="small" color="danger" (click)="confirmDelete(activity)">
                  <ion-icon slot="start" name="trash-outline"></ion-icon>
                  Excluir
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="filteredActivities.length === 0" class="ion-text-center ion-padding">
        <ion-icon name="list-outline" style="font-size: 48px; color: var(--ion-color-medium)"></ion-icon>
        <p>Nenhuma atividade encontrada</p>
      </div>

      <ion-infinite-scroll (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button routerLink="/activities/create">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [`
    .activity-card {
      border-radius: 16px;
      margin: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    ion-card-title {
      font-size: 1.2em;
      font-weight: 600;
      margin-top: 8px;
    }

    ion-chip {
      margin-right: 8px;
    }

    ion-segment {
      padding: 8px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class ActivitiesPage implements OnInit, OnDestroy {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  currentPage = 1;
  selectedStatus: string = 'all';
  private activitiesUpdatedListener: any;

  private readonly statusMap: { [key: string]: string } = {
    'in_progress': 'Em Andamento',
    'completed': 'Concluído',
    'pending': 'Pendente'
  };

  private readonly statusColors: { [key: string]: string } = {
    'Pendente': 'danger',
    'Em Andamento': 'primary',
    'Concluído': 'success'
  };

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.activitiesUpdatedListener = () => {
      this.currentPage = 1;
      this.loadActivities();
    };
    document.addEventListener('activitiesUpdated', this.activitiesUpdatedListener);
  }

  ngOnInit() {
    this.loadActivities();
  }

  ngOnDestroy() {
    document.removeEventListener('activitiesUpdated', this.activitiesUpdatedListener);
  }

  loadActivities() {
    this.activityService.getActivities(this.currentPage).subscribe(
      (response: any) => {
        this.activities = response.data;
        console.log(this.activities);
        this.filterActivities();
      }
    );
  }

  filterActivities() {
    if (this.selectedStatus === 'all') {
      this.filteredActivities = this.activities;
    } else {
      const statusName = this.statusMap[this.selectedStatus];
      if (statusName) {
        this.filteredActivities = this.activities.filter(
          activity => activity.status.name === statusName
        );
      } else {
        this.filteredActivities = this.activities;
      }
    }
  }

  handleRefresh(event: any) {
    this.currentPage = 1;
    this.activityService.getActivities(this.currentPage).subscribe(
      (response: any) => {
        this.activities = response.data;
        this.filterActivities();
        event.target.complete();
      }
    );
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || 'medium';
  }

  async confirmDelete(activity: Activity) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Deseja realmente excluir a atividade "${activity.id}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.deleteActivity(activity)
        }
      ]
    });

    await alert.present();
  }

  async deleteActivity(activity: Activity) {
    try {
      await this.activityService.deleteActivity(activity.id!).toPromise();
      this.activities = this.activities.filter(p => p.id !== activity.id);
      this.filterActivities();

      const toast = await this.toastController.create({
        message: 'Atividade excluída com sucesso',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Erro ao excluir atividade',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  loadMore(event: any) {
    this.currentPage++;
    this.activityService.getActivities(this.currentPage).subscribe(
      (response: any) => {
        this.activities = [...this.activities, ...response.data];
        this.filterActivities();
        event.target.complete();
        if (response.meta.current_page >= response.meta.last_page) {
          event.target.disabled = true;
        }
      }
    );
  }

  viewActivity(activity: Activity) {
    this.router.navigate(['/activities', activity.id]);
  }

  editActivity(activity: Activity) {
    this.router.navigate(['/activities/edit', activity.id]);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}