const cartBtnElement = document.getElementById('cart-btn')
const cartValueDuplicate = document.getElementById('cart')

let productId 

async function addProductToCart() {
    productId = cartBtnElement.dataset.productid
    csrfToken = cartBtnElement.dataset.csrf
    const product = {
        productId: productId
    }

    const responseData = await fetch('/cart', {
        method: 'POST',
        body: JSON.stringify(product),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const data = await responseData.json()
        if(data.success) {
            const cartData = await getCartData()
            cartValueDuplicate.textContent = cartData.totalNumber
        }
}

cartBtnElement.addEventListener('click', addProductToCart)