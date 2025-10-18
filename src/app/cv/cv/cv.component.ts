import { Component, inject, computed, effect } from "@angular/core";
import { Cv } from "../model/cv";
import { LoggerService } from "../../services/logger.service";
import { ToastrService } from "ngx-toastr";
import { CvService } from "../services/cv.service";
import { ListComponent } from "../list/list.component";
import { CvCardComponent } from "../cv-card/cv-card.component";
import { EmbaucheComponent } from "../embauche/embauche.component";
import { UpperCasePipe, DatePipe } from "@angular/common";
@Component({
    selector: "app-cv",
    templateUrl: "./cv.component.html",
    styleUrls: ["./cv.component.css"],
    standalone: true,
    imports: [
        ListComponent,
        CvCardComponent,
        EmbaucheComponent,
        UpperCasePipe,
        DatePipe,
    ],
})
export class CvComponent {
  private logger = inject(LoggerService);
  private toastr = inject(ToastrService);
  private cvService = inject(CvService);

  // 🚀 SIGNAUX - Remplacement des propriétés par des computed signals
  
  /**
   * Signal computed pour la liste des CVs
   */
  cvs = this.cvService.cvs$;
  
  /**
   * Signal computed pour le CV sélectionné
   */
  selectedCv = this.cvService.selectedCv$;
  
  /**
   * Signal computed pour l'état de chargement
   */
  loading = this.cvService.loading;
  
  /**
   * Signal computed pour les erreurs
   */
  error = this.cvService.error;
  
  /**
   * Date actuelle (peut rester une propriété normale)
   */
  date = new Date();

  constructor() {
    // 🚀 Charge les CVs avec la nouvelle méthode basée sur les signaux
    this.cvService.loadCvsWithSignals();
    
    this.logger.logger("je suis le cvComponent - Version Signals");
    this.toastr.info("Bienvenu dans notre CvTech - Version avec Signaux Angular!");
    
    // 🚀 EFFECT - Réaction automatique aux changements d'erreur
    effect(() => {
      const errorMsg = this.error();
      if (errorMsg) {
        this.toastr.error(errorMsg, 'Erreur de chargement');
      }
    });
    
    // 🚀 EFFECT - Log des changements de CVs
    effect(() => {
      const cvsList = this.cvs();
      this.logger.logger(`CVs chargés: ${cvsList.length} CVs disponibles`);
    });
    
    // 🚀 EFFECT - Log du CV sélectionné
    effect(() => {
      const selected = this.selectedCv();
      if (selected) {
        this.logger.logger(`CV sélectionné: ${selected.name} ${selected.firstname}`);
      }
    });
  }
}
