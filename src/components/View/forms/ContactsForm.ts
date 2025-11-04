import { FormBase } from './FormBase';

export class ContactsForm extends FormBase {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(container: HTMLElement, events: import('../../base/Events').IEvents) {
        super(container, events);
        this.emailInput = this.container.querySelector('input[name="email"]') as HTMLInputElement;
        this.phoneInput = this.container.querySelector('input[name="phone"]') as HTMLInputElement;

        this.emailInput.addEventListener('input', () => this.events.emit('contacts:email', { email: this.emailInput.value }));
        this.phoneInput.addEventListener('input', () => this.events.emit('contacts:phone', { phone: this.phoneInput.value }));
    }
}


