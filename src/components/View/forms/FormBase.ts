import { Component } from '../../base/Component';
import type { IEvents } from '../../base/Events';

export abstract class FormBase extends Component<unknown> {
    protected form: HTMLFormElement;
    protected submitButton: HTMLButtonElement;
    protected errorsEl: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this.form = this.container as HTMLFormElement;
        this.submitButton = this.container.querySelector('[type="submit"]') as HTMLButtonElement;
        this.errorsEl = this.container.querySelector('.form__errors') as HTMLElement;

        this.form.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            if (target?.name) this.events.emit('form:change', { name: target.name, value: target.value });
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('form:submit');
        });
    }

    setValid(state: boolean) {
        this.submitButton.disabled = !state;
    }

    setErrors(message: string) {
        this.errorsEl.textContent = message ?? '';
    }

    setFieldValue(name: string, value: string) {
        const field = this.form.elements.namedItem(name) as HTMLInputElement | null;
        if (field) field.value = value;
    }
}


