import { Component } from "@angular/core";
import { Observable, Subject, concatMap, map, scan, shareReplay, startWith, takeWhile } from "rxjs";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";

interface ProductsViewModel {
  products: Product[];
  total: number;
  hasMore: boolean;
}

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent {
  private readonly pageSize = 12;
  private readonly loadMoreTrigger$ = new Subject<void>();

  private readonly vmSource$ = this.loadMoreTrigger$.pipe(
    startWith(void 0),
    concatMap((_, index) =>
      this.productService.getProducts({
        limit: this.pageSize,
        skip: index * this.pageSize,
      })
    ),
    scan<ReturnType<ProductService["getProducts"]> extends Observable<infer R> ? R : never, ProductsViewModel>(
      (state, response) => {
        const products = [...state.products, ...response.products];
        return {
          products,
          total: response.total,
          hasMore: products.length < response.total,
        };
      },
      { products: [], total: 0, hasMore: true }
    ),
    takeWhile((state) => state.hasMore, true),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$: Observable<ProductsViewModel> = this.vmSource$;
  readonly products$: Observable<Product[]> = this.vm$.pipe(map((state) => state.products));
  readonly canLoadMore$: Observable<boolean> = this.vm$.pipe(map((state) => state.hasMore));

  constructor(private readonly productService: ProductService) {}

  onShowMore(): void {
    this.loadMoreTrigger$.next();
  }
}
