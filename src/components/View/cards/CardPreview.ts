import type { IProduct } from '../../../types';
import { CardBase } from './CardBase';

export class CardPreview extends CardBase {
    protected addButton: HTMLButtonElement;
    protected textEl: HTMLElement | null;

    constructor(container: HTMLElement, events: import('../../base/Events').IEvents) {
        super(container, events);
        this.addButton = this.container.querySelector('.card__button') as HTMLButtonElement;
        this.textEl = this.container.querySelector('.card__text');

        this.addButton?.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.productId) this.events.emit('card:add', { id: this.productId });
        });
    }

    setText(text?: string) {
        if (this.textEl) this.textEl.textContent = text ?? '';
    }

    render(data?: Partial<IProduct & { description?: string }>): HTMLElement {
        super.render(data);
        if (data?.id) this.setId(data.id);
        if (data?.title) this.setTitle(data.title);
        if (data?.price !== undefined) this.setPrice(data.price as number | null);
        if (data?.category) this.setCategory(data.category);
        if (data?.image) this.setImageSrc(data.image, data.title);
        this.setText((data as any)?.description);
        return this.container;
    }
}


