const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const database = require('./modules/database');
const cookieParser = require('cookie-parser');
let app = require('./modules/app');

const exp = express();

exp.set('view engine', 'ejs');

let authUserWithSession = (request, _result) => {
    let session = request.cookies.session;
    if (session)
        return app.authUserWithSession(session);
    return { ok: false };
};
const urlencodedParser = bodyParser.urlencoded({extended: false});
exp.use(bodyParser.json());
exp.use(express.static(path.join(__dirname, 'public')));
exp.use(cookieParser());

exp.get('/', function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    let data = database.query('SELECT * FROM bicycles');
        res.render('index', {
            title: 'Главная страница',
            bicycles: data,
            user: user,
            auth: auth
        });
});

exp.get('/login', urlencodedParser, function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    let text = '';
    if (user.ok) {
        auth = true;
        text = "Вы уже авторизованы";
    }
    res.render('login', {
        title: 'Авторизация',
        auth: auth,
        user: user,
        text: 'Пользователь уже авторизован'
    })
})

exp.post('/login', urlencodedParser, function (req, res) {
    let user = app.authUserWithLogin(req.body.login, req.body.password);
    let text = '';
    let auth = false;
    if (user.ok) {
        res.cookie('session', user.session);
        text = 'Авторизация прошла успешно';
        auth = true;
    } else {
        res.cookie('session', '', {expires: new Date(Date.now() - 1)});
        text = "Неверное имя или пароль";
    }
    res.render('login', {
        title: 'Авторизация',
        status: user.ok,
        user: user,
        auth: auth,
        text: text
    })
})

exp.get('/logout', urlencodedParser, function (req, res) {
    let session = req.cookies.session;
    if (session)
        app.resetSession(session);
    res.cookie('session', '', { expires: new Date(Date.now() - 1) });
    res.redirect('/login');
})

exp.get('/user', function(req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    res.render('user', {
        title: 'Личный кабинет',
        user: user,
        auth: auth
    })
})

exp.post('/user', urlencodedParser, function(req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    user = app.userChange(user.id, req.body.name, req.body.phone);
    res.render('user', {
        title: 'Личный кабинет',
        user: user,
        auth: auth
    })
})

exp.get('/registration', function(req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    res.render('registration', {
        title: 'Регистрация',
        user: user,
        auth: auth,
        isRegister: true
    })
})

exp.post('/registration', urlencodedParser, function(req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    user = app.registration(req.body.login, req.body.password, req.body.name, req.body.phone);
    res.render('user', {
        title: 'Личный кабинет',
        user: user,
        auth: auth,
        isRegister: false
    })
})

exp.get('/activations', function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    let data = database.query('SELECT * FROM orders WHERE status = ?', [0]);
    let bicycles_raw = database.query('SELECT * FROM bicycles');
    let users = database.query('SELECT * FROM users');
    let bicycles = {};
    for (let i = 0; i < bicycles_raw.length; i++)
        bicycles[bicycles_raw[i].id_bicycles] = bicycles_raw[i].mark;
    for (let i = 0; i < data.length; i++) {
        data[i].bicycles_mark = bicycles[data[i].id_bicycles];
    }
    res.render('activations', {
        title: 'Активация проката',
        user: user,
        auth: auth,
        data: data,
        users: users,
        activate: false,
        text: 'Неверная страница'
    })
})

exp.get('/activations/:id', function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok) {
        auth = true;
    }
    let order = database.query('SELECT * FROM orders WHERE id_order = ? AND id_user = ?', [req.params.id, user.id]);
    let text = "Неверный номер проката";
    let text_price = '';
    let error = false;
    if(order[0]) {
        if (order[0].status === 0) {
            database.query('UPDATE orders SET status = 1 WHERE id_order = ?', [req.params.id]);
            text_price = "Прокат активирован";
        } else if (order[0].status === 1) {
            let bicycles = database.query('SELECT * FROM bicycles WHERE id_bicycles = ?', [order[0].id_bicycles]);
            let time_order = new Date(order[0].date);
            let now = new Date();
            let price = Math.ceil((now - time_order) / 3600000) * bicycles[0].price;
            text_price = 'Прокат завершен. Стоимость проката: ' + price + ' рублей';
            database.query('UPDATE orders SET status = 2 WHERE id_order = ?', [req.params.id]);
        } else {
            error = true;
            text = "Неверный номер проката";
        }
    }
    res.render('activations', {
        title: 'Активация проката',
        activate: true,
        user: user,
        auth: auth,
        text: text,
        text_price: text_price,
        error: error,
        data: null
    })
})

exp.post('/activations', urlencodedParser, function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    let text = 'Неверный адресс страницы';
    let error = false;
    if (user.ok)
        auth = true;
    database.query('UPDATE orders SET status = 1 WHERE id_order = ?', [req.body.order]);
    let text_price = "Заказ " + req.body.order + " активирован";
    res.render('activations', {
        title: 'Активация проката',
        user: user,
        auth: auth,
        activate: true,
        data: null,
        text_price: text_price,
        text: text,
        error: error
    })
})

exp.get('/create_order/:id', function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    let data = database.query('SELECT * FROM bicycles WHERE id_bicycles = ?', [req.params.id]);
    let place = database.query('SELECT * FROM rental_place');
    res.render('create_order', {
        title: 'Создание заявки',
        place: place,
        mark: data[0].mark,
        price: data[0].price,
        id_mark: req.params.id,
        user: user,
        auth: auth,
        create_order: false
    })
})

exp.post('/create_order', urlencodedParser, function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    let order = app.addOrder(req.body.date, user.id , req.body.place, req.body.id_mark);
    res.render('create_order', {
        title: 'Создание проката',
        id_order: order.id_order,
        auth: auth,
        user: user,
        create_order: true
    })
})

exp.get('/close_order', function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    let order = database.query('SELECT * FROM orders WHERE status = ?', [1]);
    let bicycles_raw = database.query('SELECT * FROM bicycles');
    let place = database.query('SELECT * FROM rental_place');
    let users = database.query('SELECT * FROM users');
    let bicycles = {};
    for (let i = 0; i < bicycles_raw.length; i++)
        bicycles[bicycles_raw[i].id_bicycles] = bicycles_raw[i].mark;
    for (let i = 0; i < order.length; i++) {
        order[i].bicycles_mark = bicycles[order[i].id_bicycles];
    }
    res.render('close_order', {
        title: 'Закрытия проката',
        order: order,
        name: bicycles,
        place: place,
        auth: auth,
        user: user,
        users: users,
        close: false
    })
})

exp.post('/close_order', urlencodedParser, function (req, res) {
    let user = authUserWithSession(req, res);
    let auth = false;
    if (user.ok)
        auth = true;
    database.query('UPDATE orders SET status = 2, id_reception = ?  WHERE id_order = ?', [req.body.id_reception, req.body.order]);
    let orders = database.query('SELECT * FROM orders WHERE id_order = ?', [req.body.order]);
    let bicycles = database.query('SELECT * FROM bicycles WHERE id_bicycles = ?', [orders[0].id_bicycles]);
    let time_order = new Date(orders[0].date);
    let now = new Date();
    let price = Math.ceil((now - time_order) / 3600000) * bicycles[0].price;
    let text = 'Прокат завершен. Стоимость проката: ' + price + ' рублей';
    res.render('close_order', {
        title: 'Закрытия проката',
        user: user,
        auth: auth,
        text: text,
        close: true
    })
})

exp.listen(3000, function (){
    console.log("Server has been started...")
})