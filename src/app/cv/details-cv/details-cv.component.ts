import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class DetailsCvComponent implements OnInit, OnDestroy {
  private cvService = inject(CvService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);
  private destroy$ = new Subject<void>();

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
    // react to route param changes so the component updates when clicking another CV
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const idParam = params.get('id');
      const id = idParam ? +idParam : null;
      if (id !== null) {
        this.loadCv(id);
      }
    });
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
        // sync selected CV so master list highlights the current selection
        try {
          this.cvService.selectCvWithSignal(cv);
        } catch (e) {
          // ignore if method not present
        }
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
