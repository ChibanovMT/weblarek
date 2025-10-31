import { Component } from '../base/Component';

export class Gallery extends Component<unknown> {
    constructor(container: HTMLElement) {
        super(container);
    }

    setItems(items: HTMLElement[]) {
        this.container.replaceChildren(...items);
    }

    append(item: HTMLElement) {
        this.container.appendChild(item);
    }
}


