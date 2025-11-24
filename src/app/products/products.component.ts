import { Component, computed, effect, signal, resource } from "@angular/core";
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
  
  readonly productsResource = resource({
    request: () => ({ skip: this.skip(), limit: this.limit }),
    loader: ({ request }) => this.productService.fetchProducts(request.skip, request.limit)
  });

  readonly total = computed(() => this.productsResource.value()?.total ?? 0);
  readonly hasMore = computed(() => this.products().length < this.total());

  constructor(private readonly productService: ProductService) {
    effect(() => {
      const data = this.productsResource.value();
      if (data) {
        this.products.update(current => [...current, ...data.products]);
      }
    }, { allowSignalWrites: true });
  }

  onShowMore(): void {
    this.skip.update(s => s + this.limit);
  }
}
