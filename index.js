const express = require('express');
const app = express();
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', 'templates');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'suaChaveSecreta', 
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser())

let contadorTotalRequisicoes = 0;
let contadorRequisicoesPorSessao = 0;

app.get('/', (req, res) => {
    if (req.cookies.numCookie) {
        let cookie = req.cookies.numCookie
        return res.render('index', {cookie});
    }
    res.render('index');
})

app.post('/salvauser', (req, res) => {
    req.session.usuario = req.body.name;
    console.log(req.session)
    contadorTotalRequisicoes++;
    contadorRequisicoesPorSessao = 0;
    res.redirect('/');
})

app.get('/todolist', (req, res) => {
    
    let tarefas = req.session.tarefas
    if (req.session.usuario) {
        let session = req.session.usuario
        return res.render('todolist', {session, tarefas});
    }
    return res.render('todolist', {tarefas});
})
app.post('/adicionartarefa', (req, res) => {
    if (!req.session.tarefas) {
        req.session.tarefas = [];
    }
    const novaTarefa = req.body.inputTarefa;
    if (!novaTarefa) {
        return res.status(400).send('Tarefa não fornecida');
    }
    req.session.tarefas.push(novaTarefa);
    console.log('Tarefas na sessão:', req.session.tarefas);
    req.session.save();
    res.redirect('/todolist');
})
app.delete('/removertarefa', (req, res) => {
    const { index } = req.body;
    req.session.tarefas.splice(index, 1);
})

app.delete('/apagarTudo', (req, res) => {
    req.session.tarefas = [];
    res.sendStatus(200);
});

app.get('/random', (req, res) => {
    if (!req.cookies.numCookie) {
        var cookie = Math.floor(Math.random() *(100 - 1)) + 1;
        res.cookie('numCookie', cookie, {maxAge: 3 * 6 * 10000000});
    }
    contadorTotalRequisicoes++;
    contadorRequisicoesPorSessao++;
    res.redirect('/');
})

app.get('/todolist', (req, res) => {
    if (req.session.usuario) {
        res.render('todolist');
    }
})

app.get('/random', (req, res) => {
    var cookie = Math.floor(Math.random() *(100 - 1)) + 1;
    res.cookie('numCookie', cookie, {maxAge: 3 * 6 * 10000000});
    contadorTotalRequisicoes++;
    contadorRequisicoesPorSessao++;
    res.redirect('/');
})

app.get('/contador', (req, res) => {
    contadorTotalRequisicoes++;
    contadorRequisicoesPorSessao++;
    let args = {
        reqRecebidas: contadorTotalRequisicoes,
        sessoes: contadorRequisicoesPorSessao
    }
    res.render('contador', {args});
})

app.listen('3001', () => {
    console.log('http://localhost:3001')
})
