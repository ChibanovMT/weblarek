import type { IProduct } from '../../../types';
import { CardBase } from './CardBase';
import { categoryMap, CDN_URL } from '../../../utils/constants';

export class CardCatalog extends CardBase {
    protected categoryEl: HTMLElement;
    protected imageEl: HTMLImageElement;
    constructor(container: HTMLElement, events: import('../../base/Events').IEvents) {
        super(container, events);
        this.categoryEl = this.container.querySelector('.card__category') as HTMLElement;
        this.imageEl = this.container.querySelector('.card__image') as HTMLImageElement;
        this.container.addEventListener('click', () => {
            if (this.productId) this.events.emit('card:select', { id: this.productId });
        });
    }

    render(data?: Partial<IProduct>): HTMLElement {
        if (data?.id) this.setId(data.id);
        if (data?.title) this.setTitle(data.title);
        if (data?.price !== undefined) this.setPrice(data.price as number | null);
        if (data?.category) this.setCategory(data.category);
        if (data?.image) this.setImageSrc(data.image, data.title);
        return this.container;
    }

    setCategory(category: string) {
        this.categoryEl.textContent = category;
        Object.values(categoryMap).forEach(cls => this.categoryEl.classList.remove(cls));
        const mod = categoryMap[category as keyof typeof categoryMap];
        if (mod) this.categoryEl.classList.add(mod);
    }

    setImageSrc(src: string, alt?: string) {
        const full = src?.startsWith('http') ? src : `${CDN_URL}/${src}`;
        super.setImage(this.imageEl, full, alt ?? this.container.querySelector('.card__title')?.textContent ?? '');
    }
}


