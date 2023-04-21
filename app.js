const path = require('path')

const express = require('express')
const session = require('express-session')
const mongodbStore = require('connect-mongodb-session')


const db = require('./data/database')
const customerRoutes = require('./routes/customer')
const adminRoutes = require('./routes/admin')

let port = 3000

if(process.env.PORT) {
    port = process.env.PORT
}

const app = express()

const MongoDbStore = mongodbStore(session)

const sessionStore = new MongoDbStore({
    uri: 'mongodb://127.0.0.1:27017',
    databaseName: 'moshop',
    collection: 'sessions'
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
app.use('/images',express.static('images'))
app.use('/products/images',express.static('images'))
app.use('/admin/images',express.static('images'))
app.use('/admin/products/images', express.static('images'))

app.use(session({
    secret: 'athahbahayaye-is-my-super-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 2 * 24 * 60 * 60 * 1000
    }
}))

app.use(async function(req, res, next) {
    const user = req.session.user
    const isAuth = req.session.isAuthenticated

    if(!req.session.cart) {
        req.session.cart = []
    }
    if(!user || !isAuth) {
        return next()
    }
    
    const userDoc = await db.getDb().collection('users').findOne({ email: user.email })
    const isAdmin = userDoc.isAdmin

    res.locals.isAuth = isAuth
    res.locals.isAdmin = isAdmin
    
    next()
})

app.use(customerRoutes)
app.use(adminRoutes)

app.use(function(req, res, next) {
    res.render('customer/404')
})

app.use(function(error, req, res, next) {
    console.log(error)
    res.status(500).render('customer/500')
})

db.connectToDatabase().then(() => {
    console.log(port)
    app.listen(port)
}).catch(error => {
    console.log(error)
    console.log('Connection to the database failed.')
})