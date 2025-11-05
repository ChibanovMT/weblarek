import { Component } from '../../base/Component';
import type { IEvents } from '../../base/Events';
import type { IProduct } from '../../../types';

export abstract class CardBase extends Component<IProduct> {
    protected titleEl: HTMLElement;
    protected priceEl: HTMLElement;
    protected events: IEvents;
    protected productId: string | null = null;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this.titleEl = this.container.querySelector('.card__title') as HTMLElement;
        this.priceEl = this.container.querySelector('.card__price') as HTMLElement;
    }

    setId(id: string) {
        this.productId = id;
    }

    setTitle(title: string) {
        this.titleEl.textContent = title;
    }

    setPrice(price: number | null) {
        this.priceEl.textContent = price === null ? 'бесценно' : `${price} синапсов`;
    }
}


