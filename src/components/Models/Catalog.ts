import { IProduct } from "../../types";

export class Catalog {
    protected products: IProduct[] = [];
    protected selectedProduct: IProduct | null = null;

    constructor(products?: IProduct[]) {
        if (products) {
            this.products = products.slice();
        }
    }

    public setProducts(products: IProduct[]): void {
        this.products = products.slice();
    }

    public getProducts(): ReadonlyArray<IProduct> {
        return this.products;
    }

    public getProductById(id: string): IProduct | undefined {
        return this.products.find((p) => p.id === id);
    }

    public setSelectedProduct(product: IProduct | null): void {
        this.selectedProduct = product;
    }

    public getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}


