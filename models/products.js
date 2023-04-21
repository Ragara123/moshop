const mongodb = require('mongodb')

const db = require('../data/database')
const ObjectId = mongodb.ObjectId

class Product {
    constructor(title, summary, price, imagePath, description) {
        this.title = title
        this.summary = summary
        this.price = price
        this.imagePath = imagePath
        this.description = description
    }

    static async getAll() {
        const products = await db.getDb().collection('products').find({}).toArray()
        return products
    }

    async save() {
        const newProduct = {
            title: this.title,
            summary: this.summary,
            price: this.price,
            imagePath: this.imagePath,
            description: this.description
        }
        const resultObject = await  db.getDb().collection('products').insertOne(newProduct)

        return resultObject
    }

    async getSingle(id) {
        const productId =  new ObjectId(id)
        const product = await db.getDb().collection('products').findOne({ _id: productId })

        return product
    }

    async update(id, updatedObject) {
        const productId = new ObjectId(id)
        await db.getDb().collection('products').updateOne({ _id: productId }, { $set: updatedObject })
    }

    async delete(id) {
        const productId = new ObjectId(id)
        await db.getDb().collection('products').deleteOne({ _id: productId })
    }
}

module.exports = Product