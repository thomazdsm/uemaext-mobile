import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; 
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../interfaces/project.interface';

@Component({
  selector: 'app-project-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/projects"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalhes do Projeto</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="editProject()">
            <ion-icon slot="icon-only" name="create"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" *ngIf="project">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ project.title }}</ion-card-title>
          <ion-card-subtitle>
            {{ project.department.name }}
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <p>{{ project.description }}</p>

          <ion-list>
            <ion-item>
              <ion-label>
                <h3>Status</h3>
                <p>{{ project.status.name }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Tipo</h3>
                <p>{{ project.type.name }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Data de Início</h3>
                <p>{{ project.start_date | date }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Data de Término</h3>
                <p>{{ project.end_date | date }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Criado em</h3>
                <p>{{ project.created_at | date:'medium' }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Última atualização</h3>
                <p>{{ project.updated_at | date:'medium' }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ProjectDetailPage implements OnInit {
  project?: Project;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadProject(id);
    }
  }

  loadProject(id: number) {
    this.projectService.getProject(id).subscribe(
      (response: any) => {
        this.project = response.data;
      }
    );
  }

  editProject() {
    if (this.project) {
      this.router.navigate(['/projects/edit', this.project.id]);
    }
  }
}