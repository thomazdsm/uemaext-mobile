import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  title: string;
  route: string;
  color: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-menu',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="ion-text-center">Menu Principal</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="clear">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ion-padding grid-container">
        <ion-card 
          *ngFor="let item of menuItems" 
          [ngStyle]="{'background': item.color}"
          (click)="navigateTo(item.route)"
          class="menu-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">
              <ion-icon [name]="item.icon" class="menu-icon"></ion-icon>
              <div>{{ item.title }}</div>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content class="ion-text-center">
            {{ item.description }}
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 5px;
      padding: 5px;
    }

    .menu-card {
      cursor: pointer;
      transition: transform 0.2s;
      color: white;
    }

    .menu-card:active {
      transform: scale(0.95);
    }

    .menu-icon {
      font-size: 2em;
      margin-bottom: 2px;
      color: white;
    }

    ion-card-title {
      font-size: 1.2em;
      font-weight: bold;
      color: white;
    }

    ion-card-content {
      font-size: 0.9em;
      opacity: 0.9;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MenuPage {
  menuItems: MenuItem[] = [
    {
      title: 'Projetos',
      route: '/projects',
      color: '#283618',
      icon: 'folder-outline',
      description: 'Gestão de Projetos'
    },
    {
      title: 'Atividades',
      route: '/activities',
      color: '#003049',
      icon: 'list-outline',
      description: 'Lista de Atividades'
    },
    {
      title: 'Relatórios',
      route: '/reports',
      color: '#14213d',
      icon: 'document-text-outline',
      description: 'Relatórios e Análises'
    },
    {
      title: 'Departamentos',
      route: '/departments',
      color: '#343a40',
      icon: 'business-outline',
      description: 'Gestão de Departamentos'
    },
    {
      title: 'Vínculos',
      route: '/assignments',
      color: '#78290f',
      icon: 'people-outline',
      description: 'Atribuições de Projetos'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}