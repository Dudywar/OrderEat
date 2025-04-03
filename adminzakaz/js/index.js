const socket = io('https://nnmz.ru');
const url = 'https://nnmz.ru/api/complete_order';
const getOrdersUrl = 'https://nnmz.ru/api/get_orders';

axios.get(getOrdersUrl)
    .then(function (response) {
        const orders = response.data;
        for (const orderId in orders) {
            const order = orders[orderId];
            addOrderToList(orderId, order.product);
        }
    })
    .catch(function (error) {
        console.error(error);
    });

socket.on('new_order', function(data) {
    addOrderToList(data.id, data.product);
});

socket.on('order_completed', function(data) {
    const orderId = data.order_id;
    const orderElement = document.getElementById(`order-${orderId}`);
    if (orderElement) {
        orderElement.remove();
    }
});

function addOrderToList(orderId, product) {
    let orderlist = document.getElementById("order");
    let orderItem = document.createElement("div");
    orderItem.setAttribute("id", `order-${orderId}`);

    orderItem.innerHTML = `
        <p>Номер заказа: ${orderId}, Заказ: ${product}</p>
        <button id="btn-${orderId}">Заказ готов</button>
    `;
    orderlist.appendChild(orderItem);;

    document.getElementById(`btn-${orderId}`).onclick = function() {
        axios.post(url, { "id": orderId })
            .then(response => console.log(response.data.message))
            .catch(error => console.error(error));
    };
}

axios.get(getOrdersUrl)
    .then(response => {
        const orders = response.data;
        for (const orderId in orders) {
            const order = orders[orderId];
            addOrderToList(orderId, `${order.product} (Сессия: ${order.session_id})`);
        }
    });