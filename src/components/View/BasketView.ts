import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

export class BasketView extends Component<unknown> {
    protected listEl: HTMLElement;
    protected totalEl: HTMLElement;
    protected checkoutButton: HTMLButtonElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this.listEl = this.container.querySelector('.basket__list') as HTMLElement;
        this.totalEl = this.container.querySelector('.basket__price') as HTMLElement;
        this.checkoutButton = this.container.querySelector('.basket__button') as HTMLButtonElement;

        this.checkoutButton.addEventListener('click', () => this.events.emit('order:open'));
        this.listEl.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.basket__item-delete')) {
                const id = (target.closest('[data-id]') as HTMLElement)?.dataset?.id;
                if (id) this.events.emit('basket:item-remove', { id });
            }
        });
    }

    setItems(items: HTMLElement[]) {
        this.listEl.replaceChildren(...items);
    }

    setTotal(total: number) {
        this.totalEl.textContent = `${total} синапсов`;
    }

    setDisabled(disabled: boolean) {
        this.checkoutButton.disabled = disabled;
    }
}


