const User = require('./models/users');
const Message = require('./models/messages');
const Vacancy = require('./models/vacancies');
const express = require('express');
const path = require('path');
const mustache = require('mustache-express');
// const bodyParser = require('body-parser');
const busboy = require('busboy-body-parser');
const config = require('./config');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

const salt = bcrypt.genSaltSync(10);

const viewsDir = path.join(__dirname, 'views');
app.engine("mst", mustache(path.join(viewsDir, "partials")));
app.use(express.static('public'));
app.set('views', viewsDir);
app.set('view engine', 'mst');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true}));
app.use(busboy());
app.use(cookieParser());
app.use(session({
	secret: "Some_secret^string",
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getById(id)
        .then(user => done(null, user))
        .catch(err => done (err, null));
});

passport.use(new LocalStrategy((username, password, done) => {
    User.getByLogin(username)
        .then(user => {
            if (user != null) 
            { 
                done(null, user); 
                return;
            }
            if (bcrypt.compareSync(password, user.password_hash)) 
            done(null, user);
        })
        .catch(err => done(err, null));
}));

function checkAuth(req, res, next) {
    if (!req.user) return res.sendStatus(401); // 'Not authorized'
    next();  // пропускати далі тільки аутентифікованих
}

cloudinary.config({
    cloud_name : config.cloudName,
    api_key : config.apiKey,
    api_secret : config.apiSecret
});

const databaseUrl = config.databaseUrl;
const connectOption = { 
    useNewUrlParser:true,
    useUnifiedTopology: true 
};
const port = config.port;

mongoose.connect(databaseUrl, connectOption)
    .then(() => console.log(`Database connected: ${databaseUrl}`))
    .then(() => app.listen(port, () => console.log(`Server is ready at the port ${port}`)))
    .catch(err => console.log(`Start error: ${err} on bd  ${databaseUrl}`));


app.get('/', function(req, res) {
    let user = req.user;
    res.render('index', {user});
});

app.get('/register/abit', function(req, res) {
    let err = req.query.error;
    req.logout();  
    res.render('registerAbit', {err});
});

app.get('/vacancies', function(req, res) {
    Vacancy.getAll()
    .then(vacancies => {
        res.render('vacancies', {vacancies: vacancies});
    })
    .catch(err => {res.send(err)})
});

app.get('/profile', checkAuth, function(req, res) {
    let userId = req.user._id;
    console.log(userId)
    User.getById(userId)
    .then(user => {
        console.log(user)
        return Message.getAllUserMessages(user.messages)
    })
    .then(x => {
        Vacancy.getAllUserVacancys(req.user.speciality)
        .then(vacs => {
            console.log(vacs)
            let isAbit;
            let isStud;
            let isUniv;
            if (req.user.role === 1)
                isAbit = true;
            if (req.user.role === 2)
                isStud = true;
            if (req.user.role === 3)
                isUniv = true;
            res.render('profile', {
                vacancies: vacs,
                user: req.user,
                userProf: req.user,
                messages: x,
                isAbit,
                isStud,
                isUniv
            })
        })
        .catch(err => res.send(err))
    })
    .catch(err => {res.send(err)})
});

app.get('/profile/:id', checkAuth, function(req, res) {
    let us;
    User.getById(req.params.id)
    .then(user => {
        us = user;
        console.log(user);
        return Message.getAllUserMessages(user.messages)
    .then(x => {
        let curUsIsUniv = (req.user.role === 3) ? true : false;
        let curUsIsStud = (req.user.role === 2) ? true : false;
        let isAbit;
        let isStud;
        let isUniv;
        if (user.role === 1)
            isAbit = true;
        if (user.role === 2)
            isStud = true;
        if (user.role === 3)
            isUniv = true;
        res.render('profile', {
            messages: x,
            userProf: us,
            user: req.user,
            curUsIsUniv,
            curUsIsStud,
            isAbit,
            isStud,
            isUniv
        })
    })
    })
});

app.post('/profile/message', function(req, res) {
    let message = {
        message: req.body.message,
        date: Date.now(),
        author: new mongoose.Types.ObjectId(req.body.vuzId)
    }
    Message.insert(message)
    .then(msg => {
        User.getById(req.body.userId)
        .then(user => {
            user.messages.push(msg._id);
            return User.update(user._id, user)
        })
        .then(x => {
            res.redirect(`/profile/${req.body.userId}`)
        })
        .catch(err => res.send(err))
    })
    .catch(err => res.send(err))
});

app.post('/register', function(req, res) {
    let avaUser = "https://www.w3schools.com/bootstrap4/img_avatar1.png";
    let bioUser = "Hello to everyone!";
    let password = req.body.password;
    let confirmPassword = req.body.repeatPassword;

    if (password === confirmPassword)
    {
        let hash = bcrypt.hashSync(password, salt);

        let user = {login: req.body.login,fullname: req.body.fullname, password_hash: hash, role: req.body.role, avaUrl: avaUser, bio: bioUser, isDisabled: false,ticket:req.body.studtic,name:req.body.name,telephone:req.body.telephone,email:req.body.email,time:req.body.time,speciality:req.body.speciality, certificates: []};
        User.insert(user)
            .then(() => res.redirect('/login'))
            .catch((err) => {
                res.redirect('/register?error=Username+already+exist');
            });
    }
    else
    {
        res.redirect('/register?error=Missmatch+passwords');
    }
});

app.get('/register/stud', function(req, res) {
    let err = req.query.error;
    req.logout();  
    res.render('registerStud', {err});
});

app.get('/register/univ', function(req, res) {
    let err = req.query.error;
    req.logout();  
    res.render('registerUniv', {err});
});

app.get('/login', function(req, res) {
    let err = req.query.error;
    req.logout();  
    res.render('login', {err});
});

app.post('/login', function(req, res, next) {
    next();
},passport.authenticate('local', { failureRedirect: '/login?err=Hueta' }), (req, res) => {
    console.log("CurUs: " + req.user)
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    	req.logout();   
    	res.redirect('/');
});

app.get('/users', checkAuth,(req, res) => {
    let user = req.user;
    let users;
    if (user.role === 1 || user.role === 2)
    {
        User.getAllUnivs()
        .then(users => {
            res.render('users', {
                user,
                users,
            })
        })
        .catch(err => res.send(err))
    }
    else if (user.role === 3)
    {
        User.getAllAbits()
        .then(users => {
            res.render('users', {
                user,
                users,
            })
        })
        .catch(err => res.send(err))
    }
});

app.use(function(req, res) {
    res.status(404).send("404");
});