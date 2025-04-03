let cartItems = [];
const totalPriceElement = document.getElementById('total-price');
const cartItemsElement = document.getElementById('cart-items');

if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', Math.random().toString(36).substr(2, 15));
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const dishElement = button.parentElement;
        const dishName = dishElement.getAttribute('data-name');
        const dishPrice = parseFloat(dishElement.getAttribute('data-price'));

        cartItems.push({ name: dishName, price: dishPrice });
        updateCart();
    });
});

function updateCart() {
    cartItemsElement.innerHTML = '';
    let totalPrice = 0;

    cartItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.price} руб.`;
        cartItemsElement.appendChild(li);
        totalPrice += item.price;
    });

    totalPriceElement.textContent = `Итого: ${totalPrice} руб.`;
}

document.getElementById('checkout').addEventListener('click', () => {
    if (cartItems.length === 0) {
        alert('Корзина пуста!');
    } else {
        sendOrderToBackend();
        cartItems.length = 0;
        updateCart();
    }
});

async function sendOrderToBackend() {
    try {
        const statusElement = document.getElementById('status');
        statusElement.innerHTML = `<h2>Заказ готовится...</h2>`;
        
        const productsString = cartItems.map(item => item.name).join(', ');
        
        const response = await axios.post('https://nnmz.ru/api/', {
            product: productsString,
            session_id: sessionStorage.getItem('sessionId'),
        });
        
        const orderId = response.data.id;  // Получаем Firebase ключ
        statusElement.innerHTML = `
            <h2>Заказ готовится</h2>
            <h3>Номер заказа: ${orderId}</h3>  <!-- Показываем ключ пользователю -->
        `;
        
    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        alert('Произошла ошибка при оформлении заказа');
    }
}

// Подключение к SocketIO
const socket = io('https://nnmz.ru');

// Обработка завершения заказа
socket.on('order_completed', function(data) {
    if (data.session_id === sessionStorage.getItem('sessionId')) {
        document.getElementById('status').innerHTML = `
            <h2>Заказ готов!</h2>
            <h3>Номер заказа: ${data.order_id}</h3>  <!-- Показываем ключ -->
        `;
    }
});