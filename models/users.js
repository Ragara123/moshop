const mongodb = require('mongodb')

const db = require('../data/database')
const ObjectId = mongodb.ObjectId

class User {
    constructor(user) {
        this.email = user.email
        this.password = user.password
        this.fullname = user.fullname
        this.address = {
            street: user.address.street,
            postalCode: user.address.postalCode,
            city: user.address.city
        }
        if(user.email === 'simonotienoragara2000@gmail.com') {
            this.isAdmin = true
        } else {
            this.isAdmin = false
        }
    }

    static async getAll() {
        const users = await db.getDb().collection('users').find({}).toArray()
        return users
    }

    async save() {
        const newUser = { 
            email: this.email,
            password: this.password, 
            fullname: this.fullname, 
            address: this.address, 
            isAdmin: this.isAdmin 
        }
        const resultObject = await db.getDb().collection('users').insertOne(newUser)

        return resultObject
    }

    async getSingle(id) {
        const userId = new ObjectId(id)
        const user = await db.getDb().collection('users').findOne({ _id: userId })

        return user
    }

    async update(id, updatedObject) {
        const userId = new ObjectId(id)
        await db.getDb().collection('users').updateOne({ _id: userId }, { $set: updatedObject })
    }

    async delete(id) {
        const userId = new ObjectId(id)
        await db.getDb().collection('users').deleteOne({ _id: userId })
    }
}

module.exports = User