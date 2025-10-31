import { IBuyer, TPayment, BuyerValidationErrors } from "../../types";
import type { IEvents } from "../base/Events";

export class User implements IBuyer {
    payment: TPayment;
    address: string;
    email: string;
    phone: string;
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
    }

    public set(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.address !== undefined) this.address = data.address;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        this.events?.emit('user:changed', this.get());
    }

    public setPayment(payment: TPayment): void {
        this.payment = payment;
        this.events?.emit('user:payment', { payment });
        this.events?.emit('user:changed', this.get());
    }

    public setAddress(address: string): void {
        this.address = address;
        this.events?.emit('user:address', { address });
        this.events?.emit('user:changed', this.get());
    }

    public setPhone(phone: string): void {
        this.phone = phone;
        this.events?.emit('user:phone', { phone });
        this.events?.emit('user:changed', this.get());
    }

    public setEmail(email: string): void {
        this.email = email;
        this.events?.emit('user:email', { email });
        this.events?.emit('user:changed', this.get());
    }

    public get(): IBuyer {
        return {
            payment: this.payment,
            address: this.address,
            email: this.email,
            phone: this.phone,
        };
    }

    public clear(): void {
        this.payment = 'online';
        this.address = '';
        this.email = '';
        this.phone = '';
        this.events?.emit('user:cleared');
        this.events?.emit('user:changed', this.get());
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
        return !errors.payment && !errors.email && !errors.phone && !errors.address;
    }
}