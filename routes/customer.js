const express = require('express')

const router = express.Router()
const authControllers = require('../controllers/auth-controllers')
const productControllers = require('../controllers/product-controllers')

router.get('/', productControllers.getHome)

router.get('/products', productControllers.getProducts)

router.get('/products/:id', productControllers.productDetail)

router.get('/signup', authControllers.getSignUp)

router.post('/signup', authControllers.postSignUp)

router.get('/login', authControllers.getLogin)

router.post('/login', authControllers.postLogin)

router.get('/logout', authControllers.postLogout)

router.post('/logout', authControllers.postLogout)

router.get('/cart', productControllers.getCartItems)

router.post('/cart', productControllers.addProductToCart)

router.get('/cart/data', productControllers.getCartItemsData)

router.post('/cart/update', productControllers.updateCart)

router.get('/orders', productControllers.getCustomerOrders)

router.post('/orders', productControllers.postCustomerOrder)


module.exports = router