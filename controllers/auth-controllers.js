const bcrypt = require('bcryptjs')

const db = require('../data/database')

const User = require('../models/users')

function isInvalid(inputValue) {
    if(!inputValue || inputValue.trim().length === 0) {
        return true
    }
    return false
}

function getSignUp(req, res) {
    if(res.locals.isAuth) {
        return res.redirect('/')
    }
    let sessionInputSignUpData = req.session.inputSignUpData 
    if(!sessionInputSignUpData) {
      sessionInputSignUpData =  {
        hasError: false,
        errorMessage: '',
        email: '',
        confirmEmail: '',
        password: '',
        fullname: '',
        street: '',
        postalCode: '',
        city: ''
    }
    }

    
    req.session.inputSignUpData = null

    res.render('customer/signup', { 
        inputData: sessionInputSignUpData
    })
}

async function postSignUp(req, res, next) {
    const regex = /^\S+@\S+\.\S+$/
    const userData = req.body
    
    let errorMessage
    if(isInvalid(userData['email']) || isInvalid(userData['confirm-email']) || isInvalid(userData['password']) || isInvalid(userData['fullname']) || isInvalid(userData['street']) || isInvalid(userData['postal-code']) || isInvalid(userData['city'])) {
        errorMessage = 'All fields must not be left empty. Make sure you fill all the fields.'
    } else if(userData.email !== userData['confirm-email']) {
        errorMessage = 'The entered emails do not match.'
    } else if(!regex.test(userData.email)) {
        errorMessage = 'The email you entered is not valid. Make sure your email contains @ character and a dot.'
    } else if(userData.password.trim().length < 6) {
        errorMessage = 'The password you entered is too short. Password must be 6 characters or long.'
    } else if(userData.street < 0) {
        errorMessage = 'Street number cannot be negative.'
    } else if(userData['postal-code'] < 0) {
        errorMessage = 'Postal code cannot be negative.'
    } else if(userData['postal-code'] < 5) {
        errorMessage = 'The postal code you entered is not valid. Postal code must be 5 digits or more.'
    } else {
        let existingUser
        try {
        existingUser = await db.getDb().collection('users').findOne({ email: userData.email })
        } catch (error) {
            return next(error)
        }
        if(existingUser) {
            errorMessage = 'A user with that email address already exists. Log in instead or use a different email to create a new account.'
        }
    }

    if(errorMessage) {
    req.session.inputSignUpData = {
        hasError: true,
        errorMessage: errorMessage,
        email: userData.email,
        confirmEmail: userData['confirm-email'],
        password: userData.password,
        fullname: userData.fullname,
        street: userData.street,
        postalCode: userData['postal-code'],
        city: userData.city
    }

    req.session.save(() => {
        res.redirect('/signup')
    })
    return
}
let hashedPassword
try {
hashedPassword = await bcrypt.hash(userData.password, 12)
} catch (error) {
    return next(error)
}

const newUser = {
    email: userData.email,
    password: hashedPassword,
    fullname: userData.fullname,
    address: {
        street: userData.street,
        postalCode: userData['postal-code'],
        city: userData.city
    },
    isAdmin: false
}

const user = new User(newUser)
try {
await user.save()
} catch (error) {
    return next(error)
}

res.redirect('/login')
}

function getLogin(req, res) {
    if(res.locals.isAuth) {
        return res.redirect('/')
    }
    let sessionInputLoginData = req.session.inputLoginData
    if(!sessionInputLoginData) {
        sessionInputLoginData = {
            hasError: false,
            errorMessage: '',
            email: '',
            password: ''
        }
    }

    req.session.inputLoginData = null
    
    res.render('customer/login', { inputData: sessionInputLoginData })
}

async function postLogin(req, res, next) {
    const regex = /^\S+@\S+\.\S+$/
    const userData = req.body
    
    let errorMessage
    if(isInvalid(userData.email) || isInvalid(userData.password)) {
        errorMessage = 'All fields must not be left empty. Make sure you fill all the fields.'
    } else if(!regex.test(userData.email)) {
        errorMessage = 'The email you entered is not valid. Make sure your email contains @ character and a dot.'
    } else if(userData.password.trim().length < 6) {
        errorMessage = 'The password you entered is too short. Password must be 6 characters or long.'
    } 
    let existingUser
    try {
    existingUser = await db.getDb().collection('users').findOne({ email: userData.email })
    } catch (error) {
        return next(error)
    }

    let passwordsAreEqual
    if(existingUser) {
    try {
    passwordsAreEqual = await bcrypt.compare(userData.password, existingUser.password)
    } catch (error) {
        return next(error)
    }
    }
    
    if(!existingUser || !passwordsAreEqual) {
        errorMessage = 'Your credentials are invalid. E-mail address and/or password is incorrect.'
        req.session.inputLoginData = {
            hasError: true,
            errorMessage: errorMessage,
            email: userData.email,
            password: userData.password
        }
        req.session.save(() => {
            res.redirect('/login')
        })
        return 
    }
    const isAdmin = existingUser.isAdmin
    req.session.user = { email: userData.email }
    req.session.isAuthenticated = true
    req.session.save(() => {
        if(isAdmin) {
            return res.redirect('/admin')
        }
        res.redirect('/')
    })
    
}

function postLogout(req, res) {
    req.session.user = null
    req.session.isAuthenticated = false
    req.session.isAdmin = false

    res.redirect('/')
}

module.exports = {
    getSignUp,
    postSignUp,
    getLogin,
    postLogin,
    postLogout
}