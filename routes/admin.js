const express = require('express')
const multer = require('multer')

const storageConfig = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const router = express.Router()
const upload = multer({ storage: storageConfig })

const productControllers = require('../controllers/product-controllers')

router.get('/admin', productControllers.redirectToAdminPage)

router.get('/admin/products', productControllers.getAdminPage)

router.get('/admin/new-product', productControllers.getNewProduct)

router.post('/admin/new-product', upload.single('image'), productControllers.postNewProduct)

router.get('/admin/products/:id/edit', productControllers.getUpdateProduct)

router.post('/admin/products/:id/edit', upload.single('image'), productControllers.postUpdateProduct)

router.get('/admin/products/:id/delete', productControllers.deleteProduct)

router.get('/admin/products/manage', productControllers.manageProducts)

router.get('/admin/orders/manage', productControllers.getAllOrders)

router.post('/admin/orders/manage', productControllers.postOrderStatus)


module.exports = router