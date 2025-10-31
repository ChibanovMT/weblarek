import type { IProduct } from '../../../types';
import { CardBase } from './CardBase';

export class CardBasket extends CardBase {
    protected indexEl: HTMLElement | null;
    protected removeButton: HTMLButtonElement | null;

    constructor(container: HTMLElement, events: import('../../base/Events').IEvents) {
        super(container, events);
        this.indexEl = this.container.querySelector('.basket__item-index');
        this.removeButton = this.container.querySelector('.basket__item-delete');

        this.removeButton?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.productId) this.events.emit('basket:item-remove', { id: this.productId });
        });
    }

    setIndex(index: number) {
        if (this.indexEl) this.indexEl.textContent = String(index);
    }

    render(data?: Partial<IProduct> & { index?: number }): HTMLElement {
        super.render(data);
        if (data?.id) this.setId(data.id);
        if (data?.title) this.setTitle(data.title);
        if (data?.price !== undefined) this.setPrice(data.price as number | null);
        if (typeof (data as any).index === 'number') this.setIndex((data as any).index);
        return this.container;
    }
}


