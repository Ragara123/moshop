const cartValue = document.getElementById('cart')

async function getCartData() {
    const responseData = await fetch('/cart/data')
    const cartData = await responseData.json()

    return cartData
}



function changeCartValue() {
    getCartData().then((cartData) => {
        return cartData
    }).then((cartData) => {
        cartValue.textContent = cartData.totalNumber
    })    
}

changeCartValue()

 