const url = 'https://nnmz.ru/api/';
const socket = io('https://nnmz.ru');
let pokupka = document.getElementById("pokupka");
let stat = document.getElementById("status");

// Генерируем уникальный id
if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', Math.random().toString(36).substr(2, 15));
}
const sessionId = sessionStorage.getItem('sessionId');

pokupka.onclick = function() {
    stat.innerHTML = `<h1>Заказ готовится</h1>`;
    
    let zakaz = {
        "product": "Суп",
        "session_id": sessionId
    };

    axios.post(url, zakaz)
        .then(response => {
            stat.innerHTML = `<h1>Заказ готовится</h1>
                            <h1>Номер заказа: ${response.data.id}</h1>`;
        })
        .catch(error => console.log(error));
};

socket.on('order_completed', function(zak) {
    if (zak.session_id === sessionId) {
        stat.innerHTML = `<h1>Заказ готов</h1>
                        <h1>Номер заказа: ${zak.order_id}</h1>`;
    }
});