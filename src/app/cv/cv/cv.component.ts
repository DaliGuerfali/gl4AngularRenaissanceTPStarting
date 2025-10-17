import { Component, inject } from "@angular/core";
import { Cv } from "../model/cv";
import { LoggerService } from "../../services/logger.service";
import { ToastrService } from "ngx-toastr";
import { CvService } from "../services/cv.service";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

@Component({
    selector: "app-cv",
    templateUrl: "./cv.component.html",
    styleUrls: ["./cv.component.css"],
})
export class CvComponent {
  private logger = inject(LoggerService);
  private toastr = inject(ToastrService);
  private cvService = inject(CvService);

  // Keep the Observable approach - this is the RxJS part!
  cvs$: Observable<Cv[]>;
  selectedCv$: Observable<Cv | null>;
  date = new Date();

  constructor() {
    this.cvs$ = this.cvService.getCvs().pipe(
      catchError((error) => {
        this.toastr.error(`
          Attention!! Les données sont fictives, problème avec le serveur.
          Veuillez contacter l'admin.`);
        return of(this.cvService.getFakeCvs());
      })
    );

    this.selectedCv$ = this.cvService.selectCv$;

    this.logger.logger("je suis le cvComponent");
    this.toastr.info("Bienvenu dans notre CvTech");
  }
}