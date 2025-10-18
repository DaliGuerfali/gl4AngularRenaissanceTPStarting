import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from '../../../config/routes.config';
import { AuthService } from '../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { DefaultImagePipe } from '../pipes/default-image.pipe';

@Component({
    selector: 'app-details-cv',
    templateUrl: './details-cv.component.html',
    styleUrls: ['./details-cv.component.css'],
    standalone: true,
    imports: [DefaultImagePipe, CommonModule],
})
export class DetailsCvComponent implements OnInit {
  private cvService = inject(CvService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);

  // 🚀 SIGNAUX - Remplacement de la propriété cv par un signal
  
  /**
   * Signal pour le CV actuellement affiché
   */
  cv = signal<Cv | null>(null);
  
  /**
   * Signal pour l'état de chargement du CV
   */
  loading = signal<boolean>(false);
  
  /**
   * Signal pour les erreurs spécifiques à ce composant
   */
  error = signal<string | null>(null);
  
  /**
   * Signal computed pour vérifier si un CV est chargé
   */
  hasCv = computed(() => this.cv() !== null);
  
  /**
   * Signal computed pour le titre de la page
   */
  pageTitle = computed(() => {
    const currentCv = this.cv();
    return currentCv ? `CV ${currentCv.firstname} ${currentCv.name}` : 'Chargement...';
  });

  constructor() {
    // 🚀 EFFECT - Réaction automatique aux changements d'erreur
    effect(() => {
      const errorMsg = this.error();
      if (errorMsg) {
        this.toastr.error(errorMsg, 'Erreur');
        this.router.navigate([APP_ROUTES.cv]);
      }
    });
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.params['id'];
    this.loadCv(+id);
  }
  
  /**
   * Charge un CV par son ID avec gestion des signaux
   * @param id ID du CV à charger
   */
  private loadCv(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.cvService.getCvById(id).subscribe({
      next: (cv) => {
        this.cv.set(cv);
        this.loading.set(false);
        console.log(`CV chargé: ${cv.name} ${cv.firstname}`);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du CV:', error);
        this.error.set(`CV avec l'ID ${id} introuvable. Redirection vers la liste des CVs.`);
        this.loading.set(false);
      },
    });
  }
  
  /**
   * Supprime un CV avec gestion des signaux
   * @param cv CV à supprimer
   */
  deleteCv(cv: Cv): void {
    this.loading.set(true);
    
    this.cvService.deleteCvById(cv.id).subscribe({
      next: () => {
        console.log(`CV ${cv.name} ${cv.firstname} supprimé avec succès`);
        this.toastr.success(
          `${cv.name} ${cv.firstname} supprimé avec succès`, 
          'Suppression réussie'
        );
        
        // 🚀 Met à jour la liste des CVs dans le service
        this.cvService.removeCvFromList(cv.id);
        
        this.router.navigate([APP_ROUTES.cv]);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du CV:', error);
        this.toastr.error(
          `Impossible de supprimer ${cv.name} ${cv.firstname}. Problème avec le serveur.`,
          'Erreur de suppression'
        );
        this.loading.set(false);
      },
    });
  }
}
