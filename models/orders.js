const db = require('../data/database')

class Order {
    constructor(email, cart, date, status) {
        this.userEmail = email
        this.cart = cart
        this.date = date
        this.status = status
    }

    static async getAll() {
        const orders = await db.getDb().collection('orders').find({}).toArray()
        return orders
    }

    async save() {
        const newOrder = {
            userEmail: this.userEmail,
            cart: this.cart,
            date: this.date,
            status: this.status
        }
        await db.getDb().collection('orders').insertOne(newOrder)
    }

    async getCustomerOrders(email) {
        const orders = await db.getDb().collection('orders').find({}, { userEmail: email }).toArray()
        return orders
    }

    async updateOrderStatus(status, id) {
        await db.getDb().collection('orders').updateOne({ _id: id }, { $set: { status: status }}) 
    }
}

module.exports = Order