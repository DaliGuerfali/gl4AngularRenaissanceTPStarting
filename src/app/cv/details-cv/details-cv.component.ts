import { Component, OnInit, inject } from '@angular/core';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from '../../../config/routes.config';
import { AuthService } from '../../auth/services/auth.service';
import { DefaultImagePipe } from '../pipes/default-image.pipe';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
    selector: 'app-details-cv',
    templateUrl: './details-cv.component.html',
    styleUrls: ['./details-cv.component.css'],
    standalone: true,
    imports: [DefaultImagePipe, AsyncPipe, CommonModule],
})
export class DetailsCvComponent implements OnInit {
  private cvService = inject(CvService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);

  // CHANGED: cv is now an Observable
  cv$!: Observable<Cv>;

  ngOnInit() {
    const id = this.activatedRoute.snapshot.params['id'];
    
    // CHANGED: Store Observable instead of subscribing
    this.cv$ = this.cvService.getCvById(+id).pipe(
      catchError((error) => {
        // Navigate away on error
        this.router.navigate([APP_ROUTES.cv]);
        // Return empty observable to complete the stream
        return EMPTY;
      })
    );
  }

  deleteCv(cv: Cv) {
    // CHANGED: Added catchError for error handling
    this.cvService.deleteCvById(cv.id).pipe(
      tap(() => {
        // Success case
        this.toastr.success(`${cv.name} supprimé avec succès`);
        this.router.navigate([APP_ROUTES.cv]);
      }),
      catchError((error) => {
        // Error case
        this.toastr.error(`Problème avec le serveur veuillez contacter l'admin`);
        return EMPTY;
      })
    ).subscribe(); // We still need to subscribe to trigger the HTTP call
  }
}