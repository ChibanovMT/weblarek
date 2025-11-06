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

        this.closeButton.addEventListener('click', () => {
            this.close();
            this.events.emit('modal:close');
        });
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
                this.events.emit('modal:close');
            }
        });
    }

    open(content: HTMLElement) {
        this.setContent(content);
        this.container.classList.add('modal_active');
    }

    close() {
        this.container.classList.remove('modal_active');
        this.setContent(this.container.ownerDocument.createElement('div'));
    }

    setContent(content: HTMLElement) {
        this.content.replaceChildren(content);
    }
}


