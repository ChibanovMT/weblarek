import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

export class OrderSuccess extends Component<unknown> {
    protected descriptionEl: HTMLElement;
    protected closeBtn: HTMLButtonElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this.descriptionEl = this.container.querySelector('.order-success__description') as HTMLElement;
        this.closeBtn = this.container.querySelector('.order-success__close') as HTMLButtonElement;

        this.closeBtn.addEventListener('click', () => this.events.emit('success:close'));
    }

    setTotal(total: number) {
        this.descriptionEl.textContent = `Списано ${total} синапсов`;
    }
}


