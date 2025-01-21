import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="ion-padding">
      <div class="login-container">
        <h1 class="ion-text-center">UEMA EXT</h1>
        
        <form>
          <ion-list>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <ion-item>
                <ion-label position="stacked">Email</ion-label>
                <ion-input type="email" formControlName="email" placeholder="Email"></ion-input>
                <ion-icon name="mail-outline" slot="end"></ion-icon>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Senha</ion-label>
                <ion-input type="password" formControlName="password" placeholder="Senha"></ion-input>
                <ion-icon name="lock-closed-outline" slot="end"></ion-icon>
              </ion-item>

              <ion-button expand="block" type="submit" color="primary" [disabled]="!loginForm.valid">
                Entrar
              </ion-button>
            </form>

            <ion-button expand="block" color="primary" class="facebook-btn">
              <ion-icon slot="start" name="logo-facebook"></ion-icon>
              Entrar utilizando o Facebook
            </ion-button>

            <ion-button expand="block" color="danger" class="google-btn">
              <ion-icon slot="start" name="logo-google"></ion-icon>
              Entrar utilizando o Google+
            </ion-button>

            <div class="ion-text-center ion-padding-top">
              <ion-text color="primary">
                <p>Esqueci minha senha</p>
              </ion-text>
              <ion-text color="primary">
                <p>Criar uma nova conta</p>
              </ion-text>
            </div>
          </ion-list>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 0 auto;
      padding-top: 20px;
    }

    h1 {
      margin-bottom: 30px;
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 10px;
    }

    ion-button {
      margin-top: 20px;
    }

    .facebook-btn {
      --background: #3b5998;
    }

    .google-btn {
      --background: #dd4b39;
    }

    ion-text p {
      margin: 10px 0;
      cursor: pointer;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Redirecionar se já estiver autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/menu']);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        await this.authService.login(this.loginForm.value).toPromise();
        this.router.navigate(['/menu']);
      } catch (error) {
        const toast = await this.toastController.create({
          message: 'Credenciais inválidas',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    }
  }
}