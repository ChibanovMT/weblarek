import type { IApi, IProductsResponse, IProduct, IOrderRequest, IOrderResponse } from "../../types";

export class ShopApi {
    protected api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    public async getProducts(): Promise<IProduct[]> {
        const data = await this.api.get<IProductsResponse>(`/product/`);
        return data.items;
    }

    public postOrder(dto: IOrderRequest): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>(`/order/`, dto, 'POST');
    }
}


