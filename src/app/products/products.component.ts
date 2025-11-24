import { Component, computed, effect, signal } from "@angular/core";
import { toSignal, toObservable } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";

@Component({
    selector: "app-products",
    templateUrl: "./products.component.html",
    styleUrls: ["./products.component.css"],
    standalone: true,
})
export class ProductsComponent {
  private readonly limit = 12;
  readonly skip = signal(0);
  readonly products = signal<Product[]>([]);
  
  private readonly fetchParams = computed(() => ({ 
    skip: this.skip(), 
    limit: this.limit 
  }));

  private readonly productsData = toSignal(
    toObservable(this.fetchParams).pipe(
      switchMap(params => this.productService.fetchProducts(params.skip, params.limit))
    )
  );

  readonly total = computed(() => this.productsData()?.total ?? 0);
  readonly hasMore = computed(() => this.products().length < this.total());

  constructor(private readonly productService: ProductService) {
    effect(() => {
      const data = this.productsData();
      if (data) {
        this.products.update(current => [...current, ...data.products]);
      }
    }, { allowSignalWrites: true });
  }

  onShowMore(): void {
    this.skip.update(s => s + this.limit);
  }
}
