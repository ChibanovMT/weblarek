import { Component } from '../base/Component';
import type { IEvents } from '../base/Events';

export class Modal extends Component<unknown> {
    protected content: HTMLElement;
    protected closeButton: HTMLButtonElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this.content = this.container.querySelector('.modal__content') as HTMLElement;
        this.closeButton = this.container.querySelector('.modal__close') as HTMLButtonElement;

        this.closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.close();
        });
    }

    open(content: HTMLElement) {
        this.setContent(content);
        this.container.classList.add('modal_active');
        document.body.classList.add('locked');
        this.events.emit('modal:open');
    }

    close() {
        this.container.classList.remove('modal_active');
        document.body.classList.remove('locked');
        this.setContent(document.createElement('div'));
        this.events.emit('modal:close');
    }

    setContent(content: HTMLElement) {
        this.content.replaceChildren(content);
    }
}


