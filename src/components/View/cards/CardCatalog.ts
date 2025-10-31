import type { IProduct } from '../../../types';
import { CardBase } from './CardBase';

export class CardCatalog extends CardBase {
    constructor(container: HTMLElement, events: import('../../base/Events').IEvents) {
        super(container, events);
        this.container.addEventListener('click', () => {
            if (this.productId) this.events.emit('card:select', { id: this.productId });
        });
    }

    render(data?: Partial<IProduct>): HTMLElement {
        super.render(data);
        if (data?.id) this.setId(data.id);
        if (data?.title) this.setTitle(data.title);
        if (data?.price !== undefined) this.setPrice(data.price as number | null);
        if (data?.category) this.setCategory(data.category);
        if (data?.image) this.setImageSrc(data.image, data.title);
        return this.container;
    }
}


