import { IProduct } from "../../types";
import type { IEvents } from "../base/Events";

export class Catalog {
    protected products: IProduct[] = [];
    protected selectedProduct: IProduct | null = null;
    protected events?: IEvents;

    constructor(products?: IProduct[]);
    constructor(events?: IEvents, products?: IProduct[]);
    constructor(arg1?: IEvents | IProduct[], arg2?: IProduct[]) {
        if (Array.isArray(arg1)) {
            this.products = arg1.slice();
        } else {
            this.events = arg1;
            if (arg2) this.products = arg2.slice();
        }
    }

    public setProducts(products: IProduct[]): void {
        this.products = products.slice();
        this.events?.emit('catalog:items', { items: this.products, total: this.products.length });
    }

    public getProducts(): ReadonlyArray<IProduct> {
        return this.products;
    }

    public getProductById(id: string): IProduct | undefined {
        return this.products.find((p) => p.id === id);
    }

    public setSelectedProduct(product: IProduct | null): void {
        this.selectedProduct = product;
        this.events?.emit('catalog:selected', { id: product?.id ?? null });
    }

    public getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}


