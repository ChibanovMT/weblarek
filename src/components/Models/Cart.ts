import { IProduct } from "../../types";

export class Cart {
    protected items: IProduct[] = [];

    constructor(items?: IProduct[]) {
        if (items) {
            this.items = items.slice();
        }
    }

    public getItems(): ReadonlyArray<IProduct> {
        return this.items;
    }

    public add(product: IProduct): void {
        this.items.push(product);
    }

    public remove(productId: string): void {
        this.items = this.items.filter((p) => p.id !== productId);
    }

    public clear(): void {
        this.items = [];
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


