import './scss/styles.scss';
import { Catalog } from './components/Models/Catalog';
import { Cart } from './components/Models/Cart';
import { User } from './components/Models/User';
import type { IProduct, TPayment } from './types';
import { apiProducts } from './utils/data';
import { Api } from './components/base/Api';
import { ShopApi } from './components/Services/ShopApi';
import { API_URL } from './utils/constants';

// ===== Тестирование моделей данных в консоли =====

// Catalog
const catalog = new Catalog();
catalog.setProducts(apiProducts.items as IProduct[]);
// Получение всех товаров
console.log('Catalog.getProducts():', catalog.getProducts());
// Получение товара по id
const firstProductId = apiProducts.items[0]?.id;
console.log('Catalog.getProductById(firstId):', firstProductId, catalog.getProductById(firstProductId));
// Установка и получение выбранного товара
catalog.setSelectedProduct(catalog.getProductById(firstProductId) ?? null);
console.log('Catalog.getSelectedProduct():', catalog.getSelectedProduct());

// Cart
const cart = new Cart();
console.log('Cart initial:', { items: cart.getItems(), count: cart.getCount(), total: cart.getTotal() });
// Добавление пары товаров
const p1 = apiProducts.items[0] as IProduct;
const p2 = apiProducts.items[1] as IProduct;
cart.add(p1);
cart.add(p2);
console.log('Cart after add p1 & p2:', { items: cart.getItems(), count: cart.getCount(), total: cart.getTotal() });
// Проверка наличия, удаление и очистка
console.log('Cart.has(p1.id):', p1.id, cart.has(p1.id));
cart.remove(p1.id);
console.log('Cart after remove p1:', { items: cart.getItems(), count: cart.getCount(), total: cart.getTotal() });
cart.clear();
console.log('Cart after clear:', { items: cart.getItems(), count: cart.getCount(), total: cart.getTotal() });

// User (Buyer)
const user = new User();
console.log('User initial:', user.get(), { valid: user.isValid(), errors: user.validate() });
user.setAddress('г. Москва, ул. Пушкина, д. 1');
user.setPhone('+7 999 000-00-00');
user.setEmail('test@example.com');
user.setPayment('online' as TPayment);
console.log('User after partial set:', user.get(), { valid: user.isValid(), errors: user.validate() });
user.clear();
console.log('User after clear:', user.get(), { valid: user.isValid(), errors: user.validate() });

// ===== Получение каталога с сервера и сохранение в модели =====
const apiClient = new Api(API_URL);
const shopApi = new ShopApi(apiClient);
shopApi.getProducts()
    .then((products) => {
        catalog.setProducts(products);
        console.log('Fetched products -> saved to Catalog:', catalog.getProducts());
    })
    .catch((error) => {
        console.error('Failed to fetch products:', error);
    });

