export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type TPayment = 'online' | 'upon-receipt';

export interface IBuyer {
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

// Server DTOs
export interface IProductsResponse {
    total: number;
    items: IProduct[];
}

export interface IOrderRequest {
    items: { id: string; price: number }[];
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

export interface IOrderResponse {
    orderId: string;
}