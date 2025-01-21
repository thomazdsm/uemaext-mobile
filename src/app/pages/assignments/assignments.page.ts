import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { AssignmentService } from '../../services/assignment.service';
import { Assignment } from '../../interfaces/assignment.interface';

@Component({
    selector: 'app-assignments',
    template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/menu"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center">Vínculos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="clear">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

        <ion-toolbar>
            <ion-segment [(ngModel)]="selectedRole" (ionChange)="filterAssignments()">
                <ion-segment-button value="all">
                <ion-label>Todas</ion-label>
                </ion-segment-button>
                <ion-segment-button value="member">
                <ion-label>Membro</ion-label>
                </ion-segment-button>
                <ion-segment-button value="advisor">
                <ion-label>Orientador</ion-label>
                </ion-segment-button>
            </ion-segment>
        </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-card *ngFor="let assignment of filteredAssignments" class="activity-card ion-margin">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-chip [color]="getRoleColor(assignment.role)" outline>
                <ion-label>{{ getRoleLabel(assignment.role) }}</ion-label>
              </ion-chip>
              <ion-chip color="primary" outline>
                <ion-label>{{ assignment.project.title }}</ion-label>
              </ion-chip>
            </ion-card-subtitle>
            <ion-card-title>{{ assignment.user.name }}</ion-card-title>
          </ion-card-header>

          <ion-card-content>

            <ion-row class="ion-margin-top">
              <ion-col>
                <ion-button fill="clear" size="small" (click)="viewAssignment(assignment)">
                  <ion-icon slot="start" name="eye-outline"></ion-icon>
                  Detalhes
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-center">
                <ion-button fill="clear" size="small" color="primary" (click)="editAssignment(assignment)">
                  <ion-icon slot="start" name="create-outline"></ion-icon>
                  Editar
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-end">
                <ion-button fill="clear" size="small" color="danger" (click)="confirmDelete(assignment)">
                  <ion-icon slot="start" name="trash-outline"></ion-icon>
                  Excluir
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="filteredAssignments.length === 0" class="ion-text-center ion-padding">
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
    standalone: true,
    imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class AssignmentsPage implements OnInit, OnDestroy {
    assignments: Assignment[] = [];
    filteredAssignments: Assignment[] = [];
    currentPage = 1;
    selectedRole: string = 'all';
    private assignmentsUpdatedListener: any;

    private readonly roleMap: { [key: string]: string } = {
    'member': 'Membro',
    'advisor': 'Orientador'
    };

    private readonly roleColors: { [key: string]: string } = {
    'member': 'success',
    'advisor': 'danger',
    };
      
    constructor(
        private assignmentService: AssignmentService,
        private authService: AuthService,
        private router: Router,
        private toastController: ToastController,
        private alertController: AlertController
    ) {
        this.assignmentsUpdatedListener = () => {
        this.currentPage = 1;
        this.loadAssignments();
        };
        document.addEventListener('assignmentsUpdated', this.assignmentsUpdatedListener);
    }
    
    ngOnInit() {
        this.loadAssignments();
    }
    
    ngOnDestroy() {
        document.removeEventListener('assignmentsUpdated', this.assignmentsUpdatedListener);
    }

    loadAssignments() {
      this.assignmentService.getAssignments(this.currentPage).subscribe(
        (response: any) => {
          this.assignments = response.data;
          console.log(this.assignments);
          this.filterAssignments();
        }
      );
    }

    filterAssignments() {
      if (this.selectedRole === 'all') {
        this.filteredAssignments = this.assignments;
      } else {
        const roleName = this.selectedRole;
        if (roleName) {
          this.filteredAssignments = this.assignments.filter(
            assignment => assignment.role === roleName
          );
        } else {
          this.filteredAssignments = this.assignments;
        }
      }
    }
    
      handleRefresh(event: any) {
        this.currentPage = 1;
        this.assignmentService.getAssignments(this.currentPage).subscribe(
          (response: any) => {
            this.assignments = response.data;
            this.filterAssignments();
            event.target.complete();
          }
        );
      }
    
      getRoleColor(role: string): string {
        return this.roleColors[role] || 'medium';
      }
    
      getRoleLabel(role: string): string {
        return this.roleMap[role] || 'Membro';
      }
    
      async confirmDelete(assignment: Assignment) {
        const alert = await this.alertController.create({
          header: 'Confirmar exclusão',
          message: `Deseja realmente excluir o vínculo "${assignment.id}"?`,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Excluir',
              role: 'destructive',
              handler: () => this.deleteAssignment(assignment)
            }
          ]
        });
    
        await alert.present();
      }
    
      async deleteAssignment(assignment: Assignment) {
        try {
          await this.assignmentService.deleteAssignment(assignment.id!).toPromise();
          this.assignments = this.assignments.filter(p => p.id !== assignment.id);
          this.filterAssignments();
    
          const toast = await this.toastController.create({
            message: 'Vínculo excluído com sucesso',
            duration: 2000,
            color: 'success'
          });
          toast.present();
        } catch (error) {
          const toast = await this.toastController.create({
            message: 'Erro ao excluir o vínculo',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      }
    
      loadMore(event: any) {
        this.currentPage++;
        this.assignmentService.getAssignments(this.currentPage).subscribe(
          (response: any) => {
            this.assignments = [...this.assignments, ...response.data];
            this.filterAssignments();
            event.target.complete();
            if (response.meta.current_page >= response.meta.last_page) {
              event.target.disabled = true;
            }
          }
        );
      }
    
      viewAssignment(assignment: Assignment) {
        this.router.navigate(['/activities', assignment.id]);
      }
    
      editAssignment(assignment: Assignment) {
        this.router.navigate(['/activities/edit', assignment.id]);
      }

    async logout() {
        await this.authService.logout();
        this.router.navigate(['/login']);
    }
}