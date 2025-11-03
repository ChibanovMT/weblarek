import type { TPayment } from '../../../types';
import { FormBase } from './FormBase';

export class OrderForm extends FormBase {
    protected payCardBtn: HTMLButtonElement;
    protected payCashBtn: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(container: HTMLElement, events: import('../../base/Events').IEvents) {
        super(container, events);
        this.payCardBtn = this.container.querySelector('button[name="card"]') as HTMLButtonElement;
        this.payCashBtn = this.container.querySelector('button[name="cash"]') as HTMLButtonElement;
        this.addressInput = this.container.querySelector('input[name="address"]') as HTMLInputElement;

        this.payCardBtn.addEventListener('click', () => {
            this.setPayment('online');
            this.events.emit('order:payment', { payment: 'online' });
        });
        this.payCashBtn.addEventListener('click', () => {
            this.setPayment('upon-receipt');
            this.events.emit('order:payment', { payment: 'upon-receipt' });
        });

        this.addressInput.addEventListener('input', () => {
            this.events.emit('order:address', { address: this.addressInput.value });
        });
    }

    setPayment(payment: TPayment) {
        this.payCardBtn.classList.toggle('button_alt-active', payment === 'online');
        this.payCashBtn.classList.toggle('button_alt-active', payment === 'upon-receipt');
    }
}


