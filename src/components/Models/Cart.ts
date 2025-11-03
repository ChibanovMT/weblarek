import { IProduct } from "../../types";
import type { IEvents } from "../base/Events";

export class Cart {
    protected items: IProduct[] = [];
    protected events?: IEvents;

    constructor(items?: IProduct[]);
    constructor(events?: IEvents, items?: IProduct[]);
    constructor(arg1?: IEvents | IProduct[], arg2?: IProduct[]) {
        if (Array.isArray(arg1)) {
            this.items = arg1.slice();
        } else {
            this.events = arg1;
            if (arg2) this.items = arg2.slice();
        }
    }

    public getItems(): ReadonlyArray<IProduct> {
        return this.items;
    }

    public add(product: IProduct): void {
        // Do not add the same product twice
        if (this.has(product.id)) {
            return;
        }
        this.items.push(product);
        this.events?.emit('cart:changed', { items: this.items.slice(), count: this.getCount(), total: this.getTotal() });
    }

    public remove(productId: string): void {
        this.items = this.items.filter((p) => p.id !== productId);
        this.events?.emit('cart:changed', { items: this.items.slice(), count: this.getCount(), total: this.getTotal() });
    }

    public clear(): void {
        this.items = [];
        this.events?.emit('cart:changed', { items: this.items.slice(), count: 0, total: 0 });
    }

    public getTotal(): number {
        return this.items.reduce((sum, p) => sum + (p.price ?? 0), 0);
    }

    public getCount(): number {
        return this.items.length;
    }

    public has(productId: string): boolean {
        return this.items.some((p) => p.id === productId);
    }
}


