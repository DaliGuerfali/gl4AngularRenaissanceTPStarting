import { Component, inject, computed, effect } from '@angular/core';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { rxResource } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
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
export class DetailsCvComponent {
  private cvService = inject(CvService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);

  private cvId = toSignal(this.activatedRoute.params);

  readonly cvResource = rxResource({
    request: () => this.cvId()?.['id'],
    loader: ({ request: id }) => {
      if (!id) throw new Error('ID manquant');
      return this.cvService.getCvById(+id);
    }
  });

  cv = this.cvResource.value;
  loading = this.cvResource.isLoading;
  error = this.cvResource.error;
  
  pageTitle = computed(() => {
    const currentCv = this.cv();
    return currentCv ? `CV ${currentCv.firstname} ${currentCv.name}` : 'Chargement...';
  });

  constructor() {
    effect(() => {
      if (this.error()) {
        const id = this.cvId()?.['id'];
        this.toastr.error(`CV avec l'ID ${id} introuvable. Redirection vers la liste des CVs.`, 'Erreur');
        this.router.navigate([APP_ROUTES.cv]);
      }
    });
    
    effect(() => {
      const currentCv = this.cv();
      if (currentCv) {
        this.cvService.selectCvWithSignal(currentCv);
      }
    });
  }
  
  deleteCv(cv: Cv): void {
    this.cvService.deleteCvById(cv.id).subscribe({
      next: () => {
        console.log(`CV ${cv.name} ${cv.firstname} supprimé avec succès`);
        this.toastr.success(
          `${cv.name} ${cv.firstname} supprimé avec succès`, 
          'Suppression réussie'
        );
        
        this.cvService.removeCvFromList(cv.id);
        this.router.navigate([APP_ROUTES.cv]);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du CV:', error);
        this.toastr.error(
          `Impossible de supprimer ${cv.name} ${cv.firstname}. Problème avec le serveur.`,
          'Erreur de suppression'
        );
      },
    });
  }
}
