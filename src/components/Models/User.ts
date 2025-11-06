import { IBuyer, TPayment, BuyerValidationErrors } from "../../types";
import type { IEvents } from "../base/Events";

export type OrderStep = 'order' | 'contacts' | null;

export class User implements IBuyer {
    payment: TPayment;
    address: string;
    email: string;
    phone: string;
    orderStep: OrderStep;
    protected events?: IEvents;

    constructor(data?: Partial<IBuyer>);
    constructor(events?: IEvents, data?: Partial<IBuyer>);
    constructor(arg1?: IEvents | Partial<IBuyer>, arg2?: Partial<IBuyer>) {
        let data: Partial<IBuyer> | undefined;
        if (arg1 && 'on' in (arg1 as any)) {
            this.events = arg1 as IEvents;
            data = arg2;
        } else {
            data = arg1 as Partial<IBuyer> | undefined;
        }
        this.payment = (data?.payment as TPayment) ?? 'online';
        this.address = data?.address ?? '';
        this.email = data?.email ?? '';
        this.phone = data?.phone ?? '';
        this.orderStep = null;
    }

    public setPayment(payment: TPayment): void {
        this.payment = payment;
        this.events?.emit('user:changed', this.getBuyer());
    }

    public setAddress(address: string): void {
        this.address = address;
        this.events?.emit('user:changed', this.getBuyer());
    }

    public setPhone(phone: string): void {
        this.phone = phone;
        this.events?.emit('user:changed', this.getBuyer());
    }

    public setEmail(email: string): void {
        this.email = email;
        this.events?.emit('user:changed', this.getBuyer());
    }

    public getBuyer(): IBuyer {
        return {
            payment: this.payment,
            address: this.address,
            email: this.email,
            phone: this.phone,
        };
    }

    public setOrderStep(step: OrderStep): void {
        this.orderStep = step;
        this.events?.emit('user:changed', this.getBuyer());
    }

    public clear(): void {
        this.payment = 'online';
        this.address = '';
        this.email = '';
        this.phone = '';
        this.orderStep = null;
        this.events?.emit('user:cleared');
        this.events?.emit('user:changed', this.getBuyer());
    }

    public validate(): BuyerValidationErrors {
        const errors: BuyerValidationErrors = {};
        if (!this.payment) errors.payment = 'Не выбран вид оплаты';
        if (!this.email) errors.email = 'Укажите емэйл';
        if (!this.phone) errors.phone = 'Укажите телефон';
        if (!this.address) errors.address = 'Укажите адрес';
        return errors;
    }

    public isValid(): boolean {
        const errors = this.validate();
        return Object.keys(errors).length === 0;
    }
}