const mobileMenuElement = document.getElementById('mobile-menu')
const navElementsList = document.getElementById('list')

function toggleMobileMenu() {
    navElementsList.classList.toggle('open-menu')
}

mobileMenuElement.addEventListener('click', toggleMobileMenu)