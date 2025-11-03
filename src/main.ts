import './scss/styles.scss';
import { Catalog } from './components/Models/Catalog';
import { Cart } from './components/Models/Cart';
import { User } from './components/Models/User';
import type { IProduct, TPayment, IOrderRequest } from './types';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { ShopApi } from './components/Services/ShopApi';
import { API_URL } from './utils/constants';
import { PageHeader } from './components/View/PageHeader';
import { Gallery } from './components/View/Gallery';
import { Modal } from './components/View/Modal';
import { CardCatalog } from './components/View/cards/CardCatalog';
import { CardPreview } from './components/View/cards/CardPreview';
import { CardBasket } from './components/View/cards/CardBasket';
import { BasketView } from './components/View/BasketView';
import { OrderForm } from './components/View/forms/OrderForm';
import { ContactsForm } from './components/View/forms/ContactsForm';
import { OrderSuccess } from './components/View/OrderSuccess';

// Инициализация брокера событий
const events = new EventEmitter();

// Инициализация моделей данных
const catalog = new Catalog(events);
const cart = new Cart(events);
const user = new User(events);

// Инициализация API
const apiClient = new Api(API_URL);
const shopApi = new ShopApi(apiClient);

// Инициализация представлений
const headerEl = document.querySelector('.header') as HTMLElement;
const galleryEl = document.querySelector('.gallery') as HTMLElement;
const modalEl = document.getElementById('modal-container') as HTMLElement;

if (!headerEl || !galleryEl || !modalEl) {
    throw new Error('Required DOM elements not found');
}

const header = new PageHeader(headerEl, events);
const gallery = new Gallery(galleryEl);
const modal = new Modal(modalEl, events);

// Переменные для хранения текущих представлений
let basketView: BasketView | null = null;
let orderForm: OrderForm | null = null;
let contactsForm: ContactsForm | null = null;

// ===== Обработчики событий моделей данных =====

// Обработчик события catalog:items - отображение каталога товаров
events.on('catalog:items', ({ items }: { items: IProduct[]; total: number }) => {
    const cardTemplates = items.map((product) => {
        const template = document.querySelector('#card-catalog') as HTMLTemplateElement;
        const cardElement = template.content.cloneNode(true) as HTMLElement;
        const card = new CardCatalog(cardElement.firstElementChild as HTMLElement, events);
        return card.render(product);
    });
    gallery.setItems(cardTemplates);
});

// Обработчик события catalog:selected - открытие модального окна с превью товара
events.on('catalog:selected', ({ id }: { id: string | null }) => {
    if (!id) {
        modal.close();
        return;
    }

    const product = catalog.getProductById(id);
    if (!product) return;

    const template = document.querySelector('#card-preview') as HTMLTemplateElement;
    const previewElement = template.content.cloneNode(true) as HTMLElement;
    const preview = new CardPreview(previewElement.firstElementChild as HTMLElement, events);
    preview.render({ ...product, description: product.description });
    preview.setInCart(cart.has(product.id));
    modal.open(preview.render({ ...product, description: product.description }));
});

// Обработчик события cart:changed - обновление счетчика в шапке и содержимого корзины
events.on('cart:changed', ({ count, total }: { items: IProduct[]; count: number; total: number }) => {
    header.setCounter(count);

    // Если корзина открыта, обновить её содержимое
    if (basketView) {
        const items = cart.getItems();
        const cardTemplates = items.map((product, index) => {
            const template = document.querySelector('#card-basket') as HTMLTemplateElement;
            const cardElement = template.content.cloneNode(true) as HTMLElement;
            const card = new CardBasket(cardElement.firstElementChild as HTMLElement, events);
            return card.render({ ...product, index: index + 1 });
        });
        basketView.setItems(cardTemplates);
        basketView.setTotal(total);
        basketView.setDisabled(items.length === 0);
    }
});

// Обработчик события user:changed - валидация формы
events.on('user:changed', () => {
    const errors = user.validate();
    const isValid = user.isValid();

    if (orderForm) {
        orderForm.setValid(isValid);
        if (!isValid) {
            const errorMessages = Object.values(errors).filter(Boolean);
            orderForm.setErrors(errorMessages.join(', '));
        } else {
            orderForm.setErrors('');
        }
    }

    if (contactsForm) {
        contactsForm.setValid(isValid);
        if (!isValid) {
            const errorMessages = Object.values(errors).filter(Boolean);
            contactsForm.setErrors(errorMessages.join(', '));
        } else {
            contactsForm.setErrors('');
        }
    }
});

// ===== Обработчики событий представлений =====

// Обработчик события card:select - выбор товара для просмотра
events.on('card:select', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product) {
        catalog.setSelectedProduct(product);
    }
});

// Обработчик события card:add - добавление товара в корзину
events.on('card:add', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product && product.price !== null) {
        cart.add(product);
        // Close the preview modal after adding the product
        modal.close();
    }
});

// Обработчик события basket:item-remove - удаление товара из корзины
events.on('basket:item-remove', ({ id }: { id: string }) => {
    cart.remove(id);
});

// Обработчик события card:remove - удаление товара из корзины из превью
events.on('card:remove', ({ id }: { id: string }) => {
    cart.remove(id);
    modal.close();
});

// Обработчик события basket:open - открытие корзины
events.on('basket:open', () => {
    const template = document.querySelector('#basket') as HTMLTemplateElement;
    const basketElement = template.content.cloneNode(true) as HTMLElement;
    basketView = new BasketView(basketElement.firstElementChild as HTMLElement, events);

    const items = cart.getItems();
    const cardTemplates = items.map((product, index) => {
        const cardTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
        const cardElement = cardTemplate.content.cloneNode(true) as HTMLElement;
        const card = new CardBasket(cardElement.firstElementChild as HTMLElement, events);
        return card.render({ ...product, index: index + 1 });
    });
    basketView.setItems(cardTemplates);
    basketView.setTotal(cart.getTotal());
    basketView.setDisabled(items.length === 0);

    modal.open(basketView.render());
});

// Обработчик события order:open - открытие формы оформления заказа
events.on('order:open', () => {
    user.clear();
    const template = document.querySelector('#order') as HTMLTemplateElement;
    const orderElement = template.content.cloneNode(true) as HTMLElement;
    orderForm = new OrderForm(orderElement.firstElementChild as HTMLElement, events);
    orderForm.setPayment(user.payment);
    orderForm.setFieldValue('address', user.address);
    modal.setContent(orderForm.render());
});

// Обработчик события order:next - переход ко второй форме оформления
events.on('order:next', () => {
    orderForm = null; // Сбрасываем ссылку на первую форму
    const template = document.querySelector('#contacts') as HTMLTemplateElement;
    const contactsElement = template.content.cloneNode(true) as HTMLElement;
    contactsForm = new ContactsForm(contactsElement.firstElementChild as HTMLElement, events);
    contactsForm.setFieldValue('email', user.email);
    contactsForm.setFieldValue('phone', user.phone);
    modal.setContent(contactsForm.render());
});

// Обработчик события order:submit - отправка заказа
events.on('order:submit', async () => {
    if (!user.isValid()) return;

    const orderData: IOrderRequest = {
        payment: user.payment,
        email: user.email,
        phone: user.phone,
        address: user.address,
        items: cart.getItems()
            .filter(item => item.price !== null)
            .map(item => ({ id: item.id, price: item.price as number }))
    };

    try {
        const response = await shopApi.postOrder(orderData);
        console.log('Order submitted:', response);

        const template = document.querySelector('#success') as HTMLTemplateElement;
        const successElement = template.content.cloneNode(true) as HTMLElement;
        const success = new OrderSuccess(successElement.firstElementChild as HTMLElement, events);
        success.setTotal(cart.getTotal());
        modal.setContent(success.render());
    } catch (error) {
        console.error('Failed to submit order:', error);
        if (contactsForm) {
            contactsForm.setErrors('Ошибка при отправке заказа. Попробуйте ещё раз.');
        }
    }
});

// Обработчик события order:payment - выбор способа оплаты
events.on('order:payment', ({ payment }: { payment: TPayment }) => {
    user.setPayment(payment);
    if (orderForm) {
        orderForm.setPayment(payment);
    }
});

// Обработчик события order:address - изменение адреса
events.on('order:address', ({ address }: { address: string }) => {
    user.setAddress(address);
});

// Обработчик события contacts:email - изменение email
events.on('contacts:email', ({ email }: { email: string }) => {
    user.setEmail(email);
});

// Обработчик события contacts:phone - изменение телефона
events.on('contacts:phone', ({ phone }: { phone: string }) => {
    user.setPhone(phone);
});

// Обработчик события form:change - изменение данных в формах
events.on('form:change', ({ name, value }: { name: string; value: string }) => {
    if (name === 'address') {
        user.setAddress(value);
    } else if (name === 'email') {
        user.setEmail(value);
    } else if (name === 'phone') {
        user.setPhone(value);
    }
});

// Обработчик события form:submit - отправка формы
events.on('form:submit', () => {
    // Проверяем валидность перед переходом
    if (!user.isValid()) return;

    // Определяем, какая форма отправлена, по текущему контексту
    if (orderForm) {
        // Переход ко второй форме оформления заказа
        events.emit('order:next');
    } else if (contactsForm) {
        // Отправка заказа
        events.emit('order:submit');
    }
});

// Обработчик события success:close - закрытие окна успешного оформления
events.on('success:close', () => {
    cart.clear();
    user.clear();
    modal.close();
    basketView = null;
    orderForm = null;
    contactsForm = null;
});

// ===== Получение каталога с сервера и сохранение в модели =====
shopApi.getProducts()
    .then((products) => {
        catalog.setProducts(products);
    })
    .catch((error) => {
        console.error('Failed to fetch products:', error);
    });

