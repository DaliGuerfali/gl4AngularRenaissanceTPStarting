import { Component, computed, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from './dto/product.dto';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
})
export class ProductsComponent {
  private readonly limit = 12;
  readonly loadedCount = signal(12);

  readonly productsResource = rxResource({
    request: () => ({ skip: 0, limit: this.loadedCount() }),
    loader: ({ request }) =>
      this.productService.fetchProducts(request.skip, request.limit),
  });

  readonly products = computed(() => {
    const data = this.productsResource.value();
    return data?.products ?? [];
  });

  readonly total = computed(() => this.productsResource.value()?.total ?? 0);
  readonly hasMore = computed(() => this.loadedCount() < this.total());

  constructor(private readonly productService: ProductService) {}

  onShowMore(): void {
    this.loadedCount.update((count) => count + this.limit);
  }
}
