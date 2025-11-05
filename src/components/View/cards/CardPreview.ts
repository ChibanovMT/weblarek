import type { IProduct } from '../../../types';
import { CardBase } from './CardBase';
import { categoryMap, CDN_URL } from '../../../utils/constants';

export class CardPreview extends CardBase {
    protected addButton: HTMLButtonElement;
    protected textEl: HTMLElement | null;
    protected isInCart = false;
    protected currentPrice: number | null = null;
    protected categoryEl: HTMLElement;
    protected imageEl: HTMLImageElement;

    constructor(container: HTMLElement, events: import('../../base/Events').IEvents) {
        super(container, events);
        this.addButton = this.container.querySelector('.card__button') as HTMLButtonElement;
        this.textEl = this.container.querySelector('.card__text');
        this.categoryEl = this.container.querySelector('.card__category') as HTMLElement;
        this.imageEl = this.container.querySelector('.card__image') as HTMLImageElement;

        this.addButton?.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.productId || this.addButton.disabled) return;
            if (this.isInCart) {
                this.events.emit('card:remove', { id: this.productId });
            } else {
                this.events.emit('card:add', { id: this.productId });
            }
        });
    }

    setText(text?: string) {
        if (this.textEl) this.textEl.textContent = text ?? '';
    }

    render(data?: Partial<IProduct & { description?: string }>): HTMLElement {
        if (data?.id) this.setId(data.id);
        if (data?.title) this.setTitle(data.title);
        if (data?.price !== undefined) this.setPrice(data.price as number | null);
        if (data?.category) this.setCategory(data.category);
        if (data?.image) this.setImageSrc(data.image, data.title);
        this.setText((data as any)?.description);
        return this.container;
    }

    setInCart(inCart: boolean) {
        this.isInCart = inCart;
        this.updateButtonState();
    }

    setPrice(price: number | null) {
        super.setPrice(price);
        this.currentPrice = price;
        this.updateButtonState();
    }

    protected updateButtonState() {
        if (!this.addButton) return;
        if (this.currentPrice === null) {
            this.addButton.disabled = true;
            this.addButton.textContent = 'Недоступно';
        } else {
            this.addButton.disabled = false;
            this.addButton.textContent = this.isInCart ? 'Удалить из корзины' : 'Купить';
        }
    }

    setCategory(category: string) {
        this.categoryEl.textContent = category;
        Object.values(categoryMap).forEach(cls => this.categoryEl.classList.remove(cls));
        const mod = categoryMap[category as keyof typeof categoryMap];
        if (mod) this.categoryEl.classList.add(mod);
    }

    setImageSrc(src: string, alt?: string) {
        const full = src?.startsWith('http') ? src : `${CDN_URL}/${src}`;
        super.setImage(this.imageEl, full, alt ?? this.container.querySelector('.card__title')?.textContent ?? '');
    }
}


