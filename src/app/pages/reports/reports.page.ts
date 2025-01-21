import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { Report } from '../../interfaces/report.interface';

@Component({
    selector: 'app-reports',
    template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/menu"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center">Relatórios</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="clear">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Segmento para filtrar projetos -->
      <ion-toolbar>
        <ion-segment [(ngModel)]="selectedStatus" (ionChange)="filterReports()">
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

      <ion-list>
        <ion-card *ngFor="let report of filteredReports" class="report-card ion-margin">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-chip [color]="getStatusColor(report.status.name)" outline>
                <ion-label>{{ report.status.name }}</ion-label>
              </ion-chip>
              <ion-chip color="primary" outline>
                <ion-label>{{ report.project.title }}</ion-label>
              </ion-chip>
            </ion-card-subtitle>
            <ion-card-title>{{ report.name }}</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <p class="ion-margin-bottom"><b>Descrição do Relatório: </b>{{ report.description }}</p>
            
            <ion-row class="ion-margin-top">
              <ion-col>
                <ion-button fill="clear" size="small" (click)="viewReport(report)">
                  <ion-icon slot="start" name="eye-outline"></ion-icon>
                  Detalhes
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-center">
                <ion-button fill="clear" size="small" color="primary" (click)="editReport(report)">
                  <ion-icon slot="start" name="create-outline"></ion-icon>
                  Editar
                </ion-button>
              </ion-col>
              <ion-col class="ion-text-end">
                <ion-button fill="clear" size="small" color="danger" (click)="confirmDelete(report)">
                  <ion-icon slot="start" name="trash-outline"></ion-icon>
                  Excluir
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="filteredReports.length === 0" class="ion-text-center ion-padding">
        <ion-icon name="list-outline" style="font-size: 48px; color: var(--ion-color-medium)"></ion-icon>
        <p>Nenhum relatório encontrado</p>
      </div>

      <ion-infinite-scroll (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button routerLink="/reports/create">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
    `,
  styles: [`
    .report-card {
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
export class ReportsPage implements OnInit, OnDestroy {
    reports: Report[] = [];
    filteredReports: Report[] = [];
    currentPage = 1;
    selectedStatus: string = 'all';
    private reportsUpdatedListener: any;

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
        private reportService: ReportService,
        private authService: AuthService,
        private router: Router,
        private toastController: ToastController,
        private alertController: AlertController
    ) {
        this.reportsUpdatedListener = () => {
        this.currentPage = 1;
        this.loadReports();
        };
        document.addEventListener('reportsUpdated', this.reportsUpdatedListener);
    }
    
    ngOnInit() {
        this.loadReports();
    }
    
    ngOnDestroy() {
        document.removeEventListener('reportsUpdated', this.reportsUpdatedListener);
    }

    loadReports() {
      this.reportService.getReports(this.currentPage).subscribe(
        (response: any) => {
          this.reports = response.data;
          console.log(this.reports);
          this.filterReports();
        }
      );
    }

    filterReports() {
      if (this.selectedStatus === 'all') {
        this.filteredReports = this.reports;
      } else {
        const statusName = this.statusMap[this.selectedStatus];
        if (statusName) {
          this.filteredReports = this.reports.filter(
            assignment => assignment.status.name === statusName
          );
        } else {
          this.filteredReports = this.reports;
        }
      }
    }

      handleRefresh(event: any) {
        this.currentPage = 1;
        this.reportService.getReports(this.currentPage).subscribe(
          (response: any) => {
            this.reports = response.data;
            this.filterReports();
            event.target.complete();
          }
        );
      }
    
      getStatusColor(status: string): string {
        return this.statusColors[status] || 'medium';
      }
    
      async confirmDelete(report: Report) {
        const alert = await this.alertController.create({
          header: 'Confirmar exclusão',
          message: `Deseja realmente excluir o relatório "${report.id}"?`,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Excluir',
              role: 'destructive',
              handler: () => this.deleteReport(report)
            }
          ]
        });
    
        await alert.present();
      }
    
      async deleteReport(report: Report) {
        try {
          await this.reportService.deleteReport(report.id!).toPromise();
          this.reports = this.reports.filter(p => p.id !== report.id);
          this.filterReports();
    
          const toast = await this.toastController.create({
            message: 'Relatório excluída com sucesso',
            duration: 2000,
            color: 'success'
          });
          toast.present();
        } catch (error) {
          const toast = await this.toastController.create({
            message: 'Erro ao excluir o relatório',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      }
    
      loadMore(event: any) {
        this.currentPage++;
        this.reportService.getReports(this.currentPage).subscribe(
          (response: any) => {
            this.reports = [...this.reports, ...response.data];
            this.filterReports();
            event.target.complete();
            if (response.meta.current_page >= response.meta.last_page) {
              event.target.disabled = true;
            }
          }
        );
      }
    
      viewReport(report: Report) {
        this.router.navigate(['/reports', report.id]);
      }
    
      editReport(report: Report) {
        this.router.navigate(['/reports/edit', report.id]);
      }
    

    async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
    }
}