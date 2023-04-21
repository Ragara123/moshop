const mongodb = require('mongodb')

const ObjectId = mongodb.ObjectId

const Product = require('../models/products')
const Order = require('../models/orders')
const db = require('../data/database')

let product
let order

function getHome(req, res) {
    res.redirect('/products')
}

async function getProducts(req, res, next) {
    let products
    try {
    products = await Product.getAll() 
    } catch (error) {
        return next(error)
    }

    res.render('customer/home', { products: products })
}

async function productDetail(req, res, next) {
    let productId
    try {
    productId = new ObjectId(req.params.id)
    } catch {
        return res.status(404).render('customer/404')
    }

    product = new Product(null, null, null, null, null)
    let fetchedProduct
    try {
    fetchedProduct = await product.getSingle(productId)
    } catch (error) {
        return next(error)
    }

    if(!fetchedProduct) {
        return res.status(404).render('customer/404')
    }
    res.render('customer/product-detail', { product: fetchedProduct })
}

function redirectToAdminPage(req, res) {
    res.redirect('/admin/products')
}

async function getAdminPage(req, res, next) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    let products
    try {
    products = await Product.getAll()
    } catch (error) {
        return next(error)
    }

    res.render('admin/home', { products: products })
}

async function getUpdateProduct(req, res, next) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    let productId
    try {
    productId = new ObjectId(req.params.id)
    } catch {
        return res.status(404).render('customer/404')
    }
    product = new Product(null, null, null, null, null)
    let fetchedProduct
    try {
    fetchedProduct = await product.getSingle(productId)
    } catch (error) {
        return next(error)
    }

    if(!fetchedProduct) {
        return res.status(404).render('customer/404')
    }

    res.render('admin/update-product', { product: fetchedProduct })
}

async function postUpdateProduct(req, res, next) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    let productId
    try {
    productId = new ObjectId(req.params.id)
    } catch {
        return res.status(404).render('customer/404')
    }
    const uploadedFile = req.file
    const productData = req.body
    product = new Product(null, null, null, null, null)

    let newProduct
    if(productData.title.trim() === 0 || !uploadedFile || productData.summary.trim() === 0 || productData.price < 0 || productData.price.trim() === 0 || productData.description.trim() === 0) {
        newProduct = {
            title: productData.title,
            summary: productData.summary,
            price: productData.price,
            imagePath: uploadedFile ? uploadedFile.path : null,
            description: productData.description
        }
        return res.render('admin/new-product', { product: newProduct })
    }

    const updatedProduct = {
        title: productData.title,
        summary: productData.summary,
        price: productData.price,
        imagePath: uploadedFile ? uploadedFile.path : null,
        description: productData.description
    }
    try {
    await product.update(productId, updatedProduct)
    } catch (error) {
        return next(error)
    }
    res.redirect('/admin/products')
}

async function manageProducts(req, res, next) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    let products
    try {
    products = await Product.getAll()
    } catch (error) {
        return next(error)
    }
    res.render('admin/manage-products', { products: products })
}

function getNewProduct(req, res) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    product = new Product(null, null, null, null, null)
    res.render('admin/new-product', { product: product })
}

async function postNewProduct(req, res, next) {
    if(!res.locals.isAuth || !res.locals.isAdmin) {
        return
    }
    const uploadedFile = req.file
    const productData = req.body

    if(productData.title.trim() === 0 || !uploadedFile || productData.summary.trim() === 0 || productData.price < 0 || productData.price.trim() === 0 || productData.description.trim() === 0) {
        const newProduct = {
            title: productData.title,
            summary: productData.summary,
            price: productData.price,
            imagePath: uploadedFile ? uploadedFile.path : null,
            description: productData.description
        }
        return res.render('admin/new-product', { product: newProduct })
    }

    product = new Product(productData.title, productData.summary, productData.price, uploadedFile.path, productData.description)
    try {
    await product.save()
    } catch (error) {
        return next(error)
    }
    res.redirect('/admin/products/manage')
}

async function deleteProduct(req, res, next) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    let productId
    try {
    productId = new ObjectId(req.params.id)
    } catch {
        return res.status(404).render('customer/404')
    }
    product = new Product(null, null, null, null, null)
    try {
    await product.delete(productId)
    } catch (error) {
        return next(error)
    }

    res.redirect('/admin/products')
}

async function getCartItems(req, res, next) {
    const cart = req.session.cart
    req.session.cartIsEmpty = false
    let totalAmount = 0
    let items = []
    if(!cart || cart.length === 0) {
        req.session.cartIsEmpty = true
        items.push({
            title: '',
            price: '',
            numberOfItems: 0
        })
        req.session.save(() => {
            res.render('customer/cart', { items: items, cartIsEmpty: req.session.cartIsEmpty, totalAmount: totalAmount })
        }) 
        return
    }
    items = []
    product = new Product(null, null, null, null, null)
    for(const item of cart) {
        let productId
        let fetchedProduct
        try {
        productId = new ObjectId(item.productId)
        fetchedProduct = await product.getSingle(productId)
        } catch (error) {
            return next(error)
        }
        items.push({
            id: fetchedProduct._id,
            title: fetchedProduct.title,
            price: fetchedProduct.price,
            numberOfItems: item.numberOfItems
        })
        totalAmount += fetchedProduct.price * item.numberOfItems
    }
    req.session.save(() => {
        res.render('customer/cart', { items: items, cartIsEmpty: req.session.cartIsEmpty, totalAmount: totalAmount.toFixed(2) })
    })
}

async function getCartItemsData(req, res) {
    let cartTotalNumber = 0
    const cart = req.session.cart
    if(!cart) {
        req.session.cart = []
        await req.session.save()
    }
    if(cart || cart.length !== 0) {
        for(const item of cart) {
            cartTotalNumber += item.numberOfItems
        }
    }

    req.session.save()

    res.json({ totalNumber: cartTotalNumber })
}


function addProductToCart(req, res) {
    const incomingProduct = req.body
    const cart = req.session.cart

    if(!cart || cart.length === 0) {
        req.session.cart = []
        req.session.cart.push({
            productId: incomingProduct.productId,
            numberOfItems: 1
        })
    } else {
        let hasRepeated
        for(const product of cart) {
            if(product.productId === incomingProduct.productId) {
                hasRepeated = true
                product.numberOfItems += 1
                break
            }
        }
        if(!hasRepeated) {
            cart.push({
                productId: incomingProduct.productId,
                numberOfItems: 1
            })
        }
        }
    req.session.save(() => {
        res.json({ success: true })
    })
}

async function updateCart(req, res) {
    const updateItem = req.body
    const cart = req.session.cart
    const items = []
    for(let i = 0; i < cart.length; i++) {
        if(cart[i].productId === updateItem.itemId) {
            if(+updateItem.amount === 0) {
                continue
            } else {
                cart[i].numberOfItems = +updateItem.amount
                items.push(cart[i])
            }
        } else {
            items.push(cart[i])
        }
    }
    if(items.length === 0) {
        req.session.cartIsEmpty = true
    } else {
        req.session.cartIsEmpty = false
    }
    req.session.cart = items
    req.session.save(() => {
        res.redirect('/cart')
})

}

async function getCustomerOrders(req, res, next) {
    if(!res.locals.isAuth) {
        return res.redirect('/')
    }
    let totalOrderAmount = 0
    const ordersList = []
    let products = []
    const userEmail = req.session.user.email
    let existingOrders
    try {
    existingOrders = await db.getDb().collection('orders').find({}, { userEmail: userEmail }).toArray()
    } catch (error) {
        return next(error)
    }
    for(let i = 0; i < existingOrders.length; i++) {
        for(let j = 0; j < existingOrders[i].cart.length; j++) {
        let productId
        let product
        let numberOfItems
        try {
        productId = new ObjectId(existingOrders[i].cart[j].productId)
        numberOfItems = existingOrders[i].cart[j].numberOfItems
        product = await db.getDb().collection('products').findOne({ _id: productId })
        } catch (error) {
            return next(error)
        }
        products.push({
            name: product.title,
            price: product.price,
            numberOfItems: numberOfItems,
            itemOrderAmount: product.price * numberOfItems
        })
        totalOrderAmount += product.price * numberOfItems
    }
    ordersList.push({
        order: existingOrders[i],
        products: products,
        totalOrderAmount: totalOrderAmount,
        transformedDate: existingOrders[i].date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        dateStamp: existingOrders[i].date.toISOString()
    })
    totalOrderAmount = 0
    products = []
}
    res.render('customer/orders', { ordersList: ordersList })
}

async function postCustomerOrder(req, res, next) {
    const userEmail = req.session.user.email 
    const sessionCart = req.session.cart
    let cart = []
    for(const item of sessionCart) {
        cart.push(item)
    }
    const date = new Date()
    const status = 'pending'

    order = new Order(userEmail, cart, date, status)
    try {
        await order.save()
    } catch (error) {
        return next(error)
    }
      
      req.session.cart = []
      req.session.save(() => {
        res.redirect('/orders')
      })
}

async function getAllOrders(req, res, next) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    let totalOrderAmount = 0
    const ordersList = []
    let products = []
    let orders
    try {
    orders = await Order.getAll()
    } catch (error) {
        return next(error)
    }
    for(let i = 0; i < orders.length; i++) {
        const userEmail = orders[i].userEmail
        let existingUser
        try {
        existingUser = await db.getDb().collection('users').findOne({ email: userEmail })
        } catch (error) {
            return next(error)
        }
        for(let j = 0; j < orders[i].cart.length; j++) {
        let productId
        let numberOfItems
        let product
        try {
        productId = new ObjectId(orders[i].cart[j].productId)
        numberOfItems = orders[i].cart[j].numberOfItems
        product = await db.getDb().collection('products').findOne({ _id: productId })
        } catch (error) {
            return next(error)
        }
        products.push({
            name: product.title,
            price: product.price,
            numberOfItems: numberOfItems,
            itemOrderAmount: product.price * numberOfItems
        })
        totalOrderAmount += product.price * numberOfItems
    }
    ordersList.push({
        order: orders[i],
        products: products,
        totalOrderAmount: totalOrderAmount,
        transformedDate: orders[i].date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        dateStamp: orders[i].date.toISOString(),
        user: existingUser
    })
    totalOrderAmount = 0
    products = []
}
    res.render('admin/orders', { ordersList: ordersList })
}

async function postOrderStatus(req, res, next) {
    if(!res.locals.isAuth) {
        return res.status(401).render('customer/401')
    }
    if(!res.locals.isAdmin) {
        return res.status(403).render('customer/403')
    }
    const statusData = req.body
    const option = statusData.status
    let orderId
    let order
    try {
    orderId = new ObjectId(statusData.id)
    order = new Order(null, null, null, null)
    await order.updateOrderStatus(option, orderId)
    } catch (error) {
        return next(error)
    }

    res.redirect('/admin/orders/manage')
}


module.exports = {
    getHome,
    getProducts,
    productDetail,
    redirectToAdminPage,
    getAdminPage,
    getUpdateProduct,
    postUpdateProduct,
    manageProducts,
    getNewProduct,
    postNewProduct,
    deleteProduct,
    addProductToCart,
    getCartItems,
    getCartItemsData,
    updateCart,
    getCustomerOrders,
    postCustomerOrder,
    getAllOrders,
    postOrderStatus,
}