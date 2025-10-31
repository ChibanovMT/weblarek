import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

export class PageHeader extends Component<unknown> {
    protected basketButton: HTMLButtonElement;
    protected basketCounter: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this.basketButton = this.container.querySelector('.header__basket') as HTMLButtonElement;
        this.basketCounter = this.container.querySelector('.header__basket-counter') as HTMLElement;

        this.basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    setCounter(count: number) {
        this.basketCounter.textContent = String(count);
    }
}


