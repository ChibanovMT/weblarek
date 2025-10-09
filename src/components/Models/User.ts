import { IBuyer, TPayment, BuyerValidationErrors } from "../../types";

export class User implements IBuyer {
    payment: TPayment;
    address: string;
    email: string;
    phone: string;

    constructor(data?: Partial<IBuyer>) {
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
    }

    public setPayment(payment: TPayment): void {
        this.payment = payment;
    }

    public setAddress(address: string): void {
        this.address = address;
    }

    public setPhone(phone: string): void {
        this.phone = phone;
    }

    public setEmail(email: string): void {
        this.email = email;
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