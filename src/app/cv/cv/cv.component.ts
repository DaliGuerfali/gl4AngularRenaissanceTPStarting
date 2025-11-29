import { Component, inject } from "@angular/core";
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
  private cvService = inject(CvService);

  cvs = this.cvService.cvs$;
  selectedCv = this.cvService.selectedCv$;
  loading = this.cvService.loading;
  error = this.cvService.error;
  date = new Date();
}
