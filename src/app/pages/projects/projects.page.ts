import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController, AnimationController } from '@ionic/angular';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../interfaces/project.interface';

type StatusMapType = {
  [key: string]: string;
};

@Component({
  selector: 'app-projects',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/menu"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center">Projetos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="clear">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Segmento para filtrar projetos -->
      <ion-toolbar>
        <ion-segment [(ngModel)]="selectedStatus" (ionChange)="filterProjects()">
          <ion-segment-button value="all">
            <ion-label>Todos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="in_progress">
            <ion-label>Em Andamento</ion-label>
          </ion-segment-button>
          <ion-segment-button value="completed">
            <ion-label>Concluídos</ion-label>
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

      <!-- Cards de Projetos -->
      <ion-list>
        <ion-card *ngFor="let project of filteredProjects" class="project-card ion-margin">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-chip [color]="getStatusColor(project.status.name)" outline>
                <ion-label>{{ project.status.name }}</ion-label>
              </ion-chip>
              <ion-chip color="primary" outline>
                {{ project.type.name }}
              </ion-chip>
            </ion-card-subtitle>
            <ion-card-title>{{ project.title }}</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <p class="ion-margin-bottom">{{ project.description }}</p>
            
            <ion-row class="ion-align-items-center">
              <ion-col size="6">
                <ion-text color="medium">
                  <small>
                    <ion-icon name="calendar-outline"></ion-icon>
                    {{ project.start_date | date:'shortDate' }}
                  </small>
                </ion-text>
              </ion-col>
              <ion-col size="6" class="ion-text-end">
                <ion-text color="medium">
                  <small>
                    <ion-icon name="flag-outline"></ion-icon>
                    {{ project.end_date | date:'shortDate' }}
                  </small>
                </ion-text>
              </ion-col>
            </ion-row>

            <!-- Botões de Ação -->
            <ion-row class="ion-margin-top">
              <ion-col>
                <ion-button fill="clear" size="small" (click)="viewProject(project)">
                  <ion-icon slot="start" name="eye-outline"></ion-icon>
                  Detalhes
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-center">
                <ion-button fill="clear" size="small" color="primary" (click)="editProject(project)">
                  <ion-icon slot="start" name="create-outline"></ion-icon>
                  Editar
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-end">
                <ion-button fill="clear" size="small" color="danger" (click)="confirmDelete(project)">
                  <ion-icon slot="start" name="trash-outline"></ion-icon>
                  Excluir
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <!-- Mensagem quando não há projetos -->
      <div *ngIf="filteredProjects.length === 0" class="ion-text-center ion-padding">
        <ion-icon name="folder-open-outline" style="font-size: 48px; color: var(--ion-color-medium)"></ion-icon>
        <p>Nenhum projeto encontrado</p>
      </div>

      <ion-infinite-scroll (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <!-- Botão flutuante para adicionar novo projeto -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button routerLink="/projects/create">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [`
    .project-card {
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
export class ProjectsPage implements OnInit, OnDestroy {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  currentPage = 1;
  selectedStatus: string = 'all';
  private projectsUpdatedListener: any;

  private readonly statusMap: StatusMapType = {
    'in_progress': 'Em Andamento',
    'completed': 'Concluído',
    'pending': 'Pendente'
  };

  private readonly statusColors: StatusMapType = {
    'Pendente': 'warning',
    'Em Andamento': 'primary',
    'Concluído': 'success'
  };

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private animationCtrl: AnimationController
  ) {
    this.projectsUpdatedListener = () => {
      this.currentPage = 1;
      this.loadProjects();
    };
    document.addEventListener('projectsUpdated', this.projectsUpdatedListener);
  }

  ngOnInit() {
    this.loadProjects();
  }

  ngOnDestroy() {
    document.removeEventListener('projectsUpdated', this.projectsUpdatedListener);
  }

  loadProjects() {
    this.projectService.getProjects(this.currentPage).subscribe(
      (response: any) => {
        this.projects = response.data;
        this.filterProjects();
      }
    );
  }

  filterProjects() {
    if (this.selectedStatus === 'all') {
      this.filteredProjects = this.projects;
    } else {
      const statusName = this.statusMap[this.selectedStatus];
      if (statusName) {
        this.filteredProjects = this.projects.filter(
          project => project.status.name === statusName
        );
      } else {
        this.filteredProjects = this.projects;
      }
    }
  }

  handleRefresh(event: any) {
    this.currentPage = 1;
    this.projectService.getProjects(this.currentPage).subscribe(
      (response: any) => {
        this.projects = response.data;
        this.filterProjects();
        event.target.complete();
      }
    );
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || 'medium';
  }

  async confirmDelete(project: Project) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Deseja realmente excluir o projeto "${project.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.deleteProject(project)
        }
      ],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  async deleteProject(project: Project) {
    try {
      await this.projectService.deleteProject(project.id!).toPromise();
      this.projects = this.projects.filter(p => p.id !== project.id);
      this.filterProjects();

      const toast = await this.toastController.create({
        message: 'Projeto excluído com sucesso',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Erro ao excluir projeto',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      toast.present();
    }
  }

  loadMore(event: any) {
    this.currentPage++;
    this.projectService.getProjects(this.currentPage).subscribe(
      (response: any) => {
        this.projects = [...this.projects, ...response.data];
        event.target.complete();
        if (response.meta.current_page >= response.meta.last_page) {
          event.target.disabled = true;
        }
      }
    );
  }

  viewProject(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }

  editProject(project: Project) {
    this.router.navigate(['/projects/edit', project.id]);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}