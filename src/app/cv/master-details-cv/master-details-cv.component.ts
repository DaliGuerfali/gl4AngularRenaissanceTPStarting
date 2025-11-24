import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvService } from '../services/cv.service';
import { RouterModule } from '@angular/router';
import { CvCardComponent } from '../cv-card/cv-card.component';
import { DefaultImagePipe } from '../pipes/default-image.pipe';

@Component({
  selector: 'app-master-details-cv',
  templateUrl: './master-details-cv.component.html',
  styleUrls: ['./master-details-cv.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, DefaultImagePipe],
})
export class MasterDetailsCvComponent {
  public cvService = inject(CvService);

  // Signals exposed by the CvService
  cvs = this.cvService.cvs$;
  selectedCv = this.cvService.selectedCv$;

  constructor() {
    // Ensure CVs are loaded when this component is used
    if (this.cvService.loadCvsWithSignals) {
      this.cvService.loadCvsWithSignals();
    }
  }
}
