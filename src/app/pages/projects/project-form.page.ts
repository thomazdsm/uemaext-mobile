import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../interfaces/project.interface';

@Component({
    selector: 'app-project-form',
    template: `
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/projects"></ion-back-button>
          </ion-buttons>
          <ion-title>{{ isEditMode ? 'Editar' : 'Novo' }} Projeto</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content class="ion-padding">
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
          <ion-item>
            <ion-label position="floating">Título</ion-label>
            <ion-input type="text" formControlName="title"></ion-input>
          </ion-item>
  
        <ion-item>
            <ion-label position="floating">Descrição</ion-label>
            <ion-textarea formControlName="description"></ion-textarea>
        </ion-item>

        <ion-item>
            <ion-label position="stacked">Data de Início</ion-label>
            <ion-input 
                type="date" 
                formControlName="start_date"
                [min]="minDate"
            ></ion-input>
        </ion-item>

        <ion-item>
            <ion-label position="stacked">Data de Término</ion-label>
            <ion-input 
                type="date" 
                formControlName="end_date"
                [min]="projectForm.get('start_date')?.value || minDate"
            ></ion-input>
        </ion-item>
        
          <ion-item>
            <ion-label position="floating">Departamento</ion-label>
            <ion-select formControlName="department_id">
              <ion-select-option [value]="1">Departamento 1</ion-select-option>
              <ion-select-option [value]="2">Departamento 2</ion-select-option>
            </ion-select>
          </ion-item>
  
          <ion-item>
            <ion-label position="floating">Status</ion-label>
            <ion-select formControlName="status_id">
              <ion-select-option [value]="1">Pendente</ion-select-option>
              <ion-select-option [value]="2">Em Andamento</ion-select-option>
              <ion-select-option [value]="3">Concluído</ion-select-option>
            </ion-select>
          </ion-item>
  
          <ion-item>
            <ion-label position="floating">Tipo</ion-label>
            <ion-select formControlName="type_id">
              <ion-select-option [value]="1">Desenvolvimento</ion-select-option>
              <ion-select-option [value]="2">Pesquisa</ion-select-option>
              <ion-select-option [value]="3">Inovação</ion-select-option>
            </ion-select>
          </ion-item>
  
          <ion-button expand="block" type="submit" [disabled]="!projectForm.valid" class="ion-margin-top">
            {{ isEditMode ? 'Atualizar' : 'Criar' }} Projeto
          </ion-button>
        </form>
      </ion-content>
    `,
    standalone: true,
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule,
        RouterModule
    ]
})
export class ProjectFormPage implements OnInit {
    projectForm: FormGroup;
    isEditMode = false;
    projectId?: number;
    minDate: string;

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        private route: ActivatedRoute,
        private router: Router,
        private toastController: ToastController
    ) {
        // Define a data mínima como hoje
        this.minDate = new Date().toISOString().split('T')[0];

        this.projectForm = this.fb.group({
            title: ['', [Validators.required]],
            description: ['', [Validators.required]],
            start_date: ['', [Validators.required]],
            end_date: [''], // Opcional
            department_id: [null, [Validators.required]],
            status_id: [null, [Validators.required]],
            type_id: [null, [Validators.required]]
        });

        // Atualiza a data mínima do end_date quando start_date mudar
        this.projectForm.get('start_date')?.valueChanges.subscribe(val => {
            const endDateControl = this.projectForm.get('end_date');
            if (endDateControl?.value && endDateControl.value < val) {
                endDateControl.setValue('');
            }
        });
    }

    ngOnInit() {
        this.projectId = this.route.snapshot.params['id'];
        if (this.projectId) {
            this.isEditMode = true;
            this.loadProject();
        }
    }

    loadProject() {
        this.projectService.getProject(this.projectId!).subscribe(
            (response: any) => {
                const project = response.data;
                this.projectForm.patchValue({
                    title: project.title,
                    description: project.description,
                    start_date: project.start_date,
                    end_date: project.end_date,
                    department_id: project.department.id,
                    status_id: project.status.id,
                    type_id: project.type.id
                });
            }
        );
    }

    async onSubmit() {
        if (this.projectForm.valid) {
            try {
                const formData = this.projectForm.value;

                if (this.isEditMode) {
                    await this.projectService.updateProject(this.projectId!, formData).toPromise();
                } else {
                    await this.projectService.createProject(formData).toPromise();
                }

                const toast = await this.toastController.create({
                    message: `Projeto ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso`,
                    duration: 2000,
                    color: 'success'
                });
                toast.present();

                // Emite um evento para atualizar a lista
                document.dispatchEvent(new CustomEvent('projectsUpdated'));
                
                this.router.navigate(['/projects']);
            } catch (error: any) {
                console.log('Error Response:', error.error); // Log completo do erro

                let errorMessage = 'Erro ao criar projeto';

                // Se houver mensagens de validação específicas
                if (error.error && error.error.errors) {
                    errorMessage = Object.values(error.error.errors).join('\n');
                } else if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                }

                const toast = await this.toastController.create({
                    message: errorMessage,
                    duration: 3000,
                    color: 'danger',
                    position: 'top'
                });
                toast.present();
            }
        }
    }

    private formatDate(date: string): string {
        if (!date) return '';
        // Assumindo que a data está vindo no formato do input HTML
        return date.split('T')[0]; // Retorna apenas a parte da data (YYYY-MM-DD)
    }
}