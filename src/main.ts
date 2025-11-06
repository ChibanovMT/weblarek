import './scss/styles.scss';
import { Catalog } from './components/Models/Catalog';
import { Cart } from './components/Models/Cart';
import { User } from './components/Models/User';
import type { IProduct, TPayment, IOrderRequest } from './types';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { ShopApi } from './components/Services/ShopApi';
import { API_URL } from './utils/constants';
import { cloneTemplate } from './utils/utils';
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

// Запрашиваем HTML-шаблоны один раз и переиспользуем
const tplCardCatalog = document.querySelector('#card-catalog') as HTMLTemplateElement;
const tplCardPreview = document.querySelector('#card-preview') as HTMLTemplateElement;
const tplCardBasket = document.querySelector('#card-basket') as HTMLTemplateElement;
const tplBasket = document.querySelector('#basket') as HTMLTemplateElement;
const tplOrder = document.querySelector('#order') as HTMLTemplateElement;
const tplContacts = document.querySelector('#contacts') as HTMLTemplateElement;
const tplSuccess = document.querySelector('#success') as HTMLTemplateElement;

if (!tplCardCatalog || !tplCardPreview || !tplCardBasket || !tplBasket || !tplOrder || !tplContacts || !tplSuccess) {
    throw new Error('Required HTML templates not found');
}

// Инициализация представлений форм и корзины
const basketElement = cloneTemplate<HTMLElement>(tplBasket);
const basketView = new BasketView(basketElement, events);

const orderElement = cloneTemplate<HTMLElement>(tplOrder);
const orderForm = new OrderForm(orderElement, events);

const contactsElement = cloneTemplate<HTMLElement>(tplContacts);
const contactsForm = new ContactsForm(contactsElement, events);

// Единое состояние представлений
const ui = {
    basketView,
    orderForm,
    contactsForm
};

// ===== Обработчики событий моделей данных =====

// Обработчик события catalog:items - отображение каталога товаров
events.on('catalog:items', ({ items }: { items: IProduct[]; total: number }) => {
    const cardTemplates = items.map((product) => {
        const cardElement = cloneTemplate<HTMLElement>(tplCardCatalog);
        const card = new CardCatalog(cardElement, events);
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

    const previewElement = cloneTemplate<HTMLElement>(tplCardPreview);
    const preview = new CardPreview(previewElement, events);
    preview.render({ ...product, description: product.description });
    preview.setInCart(cart.has(product.id));
    modal.open(preview.render({ ...product, description: product.description }));
});

// Обработчик события cart:changed - обновление счетчика в шапке и содержимого корзины
events.on('cart:changed', ({ count, total }: { items: IProduct[]; count: number; total: number }) => {
    header.setCounter(count);

    const items = cart.getItems();
    const cardTemplates = items.map((product, index) => {
        const cardElement = cloneTemplate<HTMLElement>(tplCardBasket);
        const card = new CardBasket(cardElement, events);
        return card.render({ ...product, index: index + 1 });
    });
    ui.basketView.setItems(cardTemplates);
    ui.basketView.setTotal(total);
    ui.basketView.setDisabled(items.length === 0);
});

// Обработчик события user:changed - валидация формы
events.on('user:changed', () => {
    const errors = user.validate();

    // Валидация для OrderForm (только payment и address)
    if (user.orderStep === 'order') {
        const orderErrors: string[] = [];
        if (errors.payment) orderErrors.push(errors.payment);
        if (errors.address) orderErrors.push(errors.address);
        const isOrderValid = !errors.payment && !errors.address;
        
        ui.orderForm.setValid(isOrderValid);
        if (!isOrderValid) {
            ui.orderForm.setErrors(orderErrors.join(', '));
        } else {
            ui.orderForm.setErrors('');
        }

        // Синхронизация значений формы с моделью пользователя
        ui.orderForm.setPayment(user.payment);
        ui.orderForm.setFieldValue('address', user.address);
    }

    // Валидация для ContactsForm (только email и phone)
    if (user.orderStep === 'contacts') {
        const contactsErrors: string[] = [];
        if (errors.email) contactsErrors.push(errors.email);
        if (errors.phone) contactsErrors.push(errors.phone);
        const isContactsValid = !errors.email && !errors.phone;
        
        ui.contactsForm.setValid(isContactsValid);
        if (!isContactsValid) {
            ui.contactsForm.setErrors(contactsErrors.join(', '));
        } else {
            ui.contactsForm.setErrors('');
        }

        // Синхронизация значений формы с моделью пользователя
        ui.contactsForm.setFieldValue('email', user.email);
        ui.contactsForm.setFieldValue('phone', user.phone);
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
    const items = cart.getItems();
    const cardTemplates = items.map((product, index) => {
        const cardElement = cloneTemplate<HTMLElement>(tplCardBasket);
        const card = new CardBasket(cardElement, events);
        return card.render({ ...product, index: index + 1 });
    });
    ui.basketView.setItems(cardTemplates);
    ui.basketView.setTotal(cart.getTotal());
    ui.basketView.setDisabled(items.length === 0);

    modal.open(ui.basketView.render());
});

// Обработчик события order:open - открытие формы оформления заказа
events.on('order:open', () => {
    user.clear();
    user.setOrderStep('order');
    ui.orderForm.setPayment(user.payment);
    ui.orderForm.setFieldValue('address', user.address);
    modal.setContent(ui.orderForm.render());
});

// Обработчик события order:next - переход ко второй форме оформления
events.on('order:next', () => {
    user.setOrderStep('contacts');
    ui.contactsForm.setFieldValue('email', user.email);
    ui.contactsForm.setFieldValue('phone', user.phone);
    modal.setContent(ui.contactsForm.render());
});

// Обработчик события order:payment - выбор способа оплаты
events.on('order:payment', ({ payment }: { payment: TPayment }) => {
    user.setPayment(payment);
    if (user.orderStep === 'order') {
        ui.orderForm.setPayment(payment);
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
events.on('form:submit', async () => {
    console.log('form:submit event received');
    const errors = user.validate();

    // Определяем, какая форма отправлена, по состоянию в модели
    if (user.orderStep === 'order') {
        console.log('Processing OrderForm submit');
        // Для OrderForm проверяем только payment и address
        const isOrderValid = !errors.payment && !errors.address;
        if (!isOrderValid) {
            console.log('OrderForm validation failed:', errors);
            return;
        }
        // Переход ко второй форме оформления заказа
        user.setOrderStep('contacts');
        ui.contactsForm.setFieldValue('email', user.email);
        ui.contactsForm.setFieldValue('phone', user.phone);
        modal.setContent(ui.contactsForm.render());
    } else if (user.orderStep === 'contacts') {
        console.log('Processing ContactsForm submit');
        // Для ContactsForm при отправке проверяем все поля
        if (!user.isValid()) {
            console.log('ContactsForm validation failed');
            return;
        }
        // Отправка заказа
        console.log('Submitting order');
        const items = cart.getItems().filter(item => item.price !== null);
        const orderData: IOrderRequest = {
            payment: user.payment,
            email: user.email,
            phone: user.phone,
            address: user.address,
            items: items.map(item => item.id),
            total: cart.getTotal()
        };

        console.log('Sending order:', orderData);
        try {
            const response = await shopApi.postOrder(orderData);
            console.log('Order submitted successfully:', response);

            // Сохраняем сумму заказа перед очисткой корзины
            const total = cart.getTotal();
            // Очищаем корзину после успешного подтверждения от сервера
            cart.clear();

            if (!tplSuccess) {
                console.error('Success template not found');
                return;
            }
            const successElement = cloneTemplate<HTMLElement>(tplSuccess);
            const success = new OrderSuccess(successElement, events);
            console.log('Setting total:', total);
            success.setTotal(total);
            const rendered = success.render();
            console.log('Rendered success element:', rendered);
            modal.open(rendered);
            console.log('Modal opened with success content');
        } catch (error) {
            console.error('Failed to submit order:', error);
            const message = typeof error === 'string' && error.trim().length > 0
                ? error
                : 'Ошибка при отправке заказа. Попробуйте ещё раз.';
            if (user.orderStep === 'contacts') {
                ui.contactsForm.setErrors(message);
            }
        }
    }
});

// Обработчик события success:close - закрытие окна успешного оформления
events.on('success:close', () => {
    user.clear();
    modal.close();
});

// ===== Получение каталога с сервера и сохранение в модели =====
shopApi.getProducts()
    .then((products) => {
        catalog.setProducts(products);
    })
    .catch((error) => {
        console.error('Failed to fetch products:', error);
    });

