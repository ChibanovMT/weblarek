import { Component } from '../../base/Component';
import type { IEvents } from '../../base/Events';
import type { IProduct } from '../../../types';
import { categoryMap, CDN_URL } from '../../../utils/constants';

export abstract class CardBase extends Component<IProduct> {
    protected titleEl: HTMLElement;
    protected priceEl: HTMLElement;
    protected categoryEl: HTMLElement;
    protected imageEl: HTMLImageElement;
    protected events: IEvents;
    protected productId: string | null = null;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this.titleEl = this.container.querySelector('.card__title') as HTMLElement;
        this.priceEl = this.container.querySelector('.card__price') as HTMLElement;
        this.categoryEl = this.container.querySelector('.card__category') as HTMLElement;
        this.imageEl = this.container.querySelector('.card__image') as HTMLImageElement;
    }

    setId(id: string) {
        this.productId = id;
        this.container.setAttribute('data-id', id);
    }

    setTitle(title: string) {
        this.titleEl.textContent = title;
    }

    setPrice(price: number | null) {
        this.priceEl.textContent = price === null ? 'бесценно' : `${price} синапсов`;
    }

    setCategory(category: string) {
        this.categoryEl.textContent = category;
        Object.values(categoryMap).forEach(cls => this.categoryEl.classList.remove(cls));
        const mod = categoryMap[category as keyof typeof categoryMap];
        if (mod) this.categoryEl.classList.add(mod);
    }

    setImageSrc(src: string, alt?: string) {
        const full = src?.startsWith('http') ? src : `${CDN_URL}/${src}`;
        super.setImage(this.imageEl, full, alt ?? this.titleEl.textContent ?? '');
    }
}


