document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { id: 1, name: "Fresh Mangoes ", price: 120.00, image: "images/mango.jpg", description: "Sweet and juicy Philippine mangoes, perfect for desserts or snacking.", featured: true },
        { id: 2, name: "Organic Spinach ", price: 80.00, image: "images/spi.jpg", description: "Freshly harvested organic spinach, packed with nutrients.", featured: true },
        { id: 3, name: "Sweet Pineapples ", price: 70.00, image: "images/pine.jpg", description: "Naturally sweet and tangy pineapples, great for a tropical treat.", featured: true },
        { id: 4, name: "Crisp Carrots ", price: 50.00, image: "images/rots.jpg", description: "Crunchy and vibrant carrots, ideal for cooking or salads.", featured: true },
        { id: 5, name: "Red Tomatoes ", price: 60.00, image: "images/red.jpg", description: "Plump and ripe red tomatoes, a kitchen staple for many dishes." },
        { id: 6, name: "Green Cabbages ", price: 45.00, image: "images/green.jpg", description: "Fresh and firm green cabbages, versatile for various recipes." },
        { id: 7, name: "Local Bananas ", price: 90.00, image: "images/local.jpg", description: "Delicious and energy-boosting local bananas (Saba or Lakatan)." },
        { id: 8, name: "Fresh Eggplants ", price: 55.00, image: "images/eggplant.jpg", description: "Glossy and firm eggplants, perfect for grilling or frying." }
    ];

    const featuredProductsContainer = document.getElementById('featured-products-container');
    const allProductsContainer = document.getElementById('all-products-container');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummaryContainer = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutForm = document.getElementById('checkout-form');
    const contactForm = document.getElementById('contact-form');
    const currentYearSpan = document.getElementById('current-year');
    const checkoutOrderSummaryContainer = document.getElementById('checkout-order-summary');
    const checkoutTotalContainer = document.getElementById('checkout-total-container');
    const toastContainer = document.getElementById('toast-container');

    function getCart() {
        return JSON.parse(localStorage.getItem('gulayAtPrutasCart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('gulayAtPrutasCart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalItems);
        if (document.querySelector('.cart-count-summary')) {
             document.querySelector('.cart-count-summary').textContent = totalItems;
        }
    }
    
    function formatPrice(price) {
        return `₱${price.toFixed(2)}`;
    }

    function showToast(productName) {
        if (!toastContainer) return;
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000" style="background-color: var(--primary-theme-color);">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-check-circle-fill me-2"></i> "${productName}" added to basket!
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    function displayProducts(container, productList) {
        if (!container) return;
        container.innerHTML = '';
        productList.forEach(product => {
            const productCard = `
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="card product-card h-100">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text small">${product.description}</p>
                            <div class="mt-auto">
                                <p class="price">${formatPrice(product.price)}</p>
                                <button class="btn btn-primary w-100 add-to-cart-btn" data-product-id="${product.id}">Add to Basket</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += productCard;
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                addToCart(productId);
            });
        });
    }

    function addToCart(productId) {
        const cart = getCart();
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name: product.name, price: product.price, image: product.image, quantity: 1 });
        }
        saveCart(cart);
        showToast(product.name);
    }

    function loadCartPage() {
        if (!cartItemsContainer || !cartSummaryContainer) return;

        const cart = getCart();
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            if(emptyCartMessage) emptyCartMessage.style.display = 'block';
            if(cartSummaryContainer) cartSummaryContainer.innerHTML = '';
            return;
        }
        if(emptyCartMessage) emptyCartMessage.style.display = 'none';

        let cartTableHTML = `
            <div class="table-responsive shadow-sm bg-white rounded p-3">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th scope="col" style="width: 10%;">Image</th>
                            <th scope="col" style="width: 30%;">Product</th>
                            <th scope="col" class="text-center" style="width: 15%;">Price</th>
                            <th scope="col" class="text-center" style="width: 20%;">Quantity</th>
                            <th scope="col" class="text-end" style="width: 15%;">Subtotal</th>
                            <th scope="col" class="text-center" style="width: 10%;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let total = 0;
        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;
            cartTableHTML += `
                <tr>
                    <td><img src="${item.image}" alt="${item.name}" class="img-fluid rounded"></td>
                    <td><a href="#" class="text-dark fw-bold text-decoration-none">${item.name}</a></td>
                    <td class="text-center">${formatPrice(item.price)}</td>
                    <td class="text-center">
                        <div class="input-group input-group-sm justify-content-center">
                            <button class="btn btn-outline-secondary quantity-decrease-btn" type="button" data-product-id="${item.id}"><i class="bi bi-dash"></i></button>
                            <input type="text" class="form-control quantity-input text-center" value="${item.quantity}" min="1" data-product-id="${item.id}" readonly>
                            <button class="btn btn-outline-secondary quantity-increase-btn" type="button" data-product-id="${item.id}"><i class="bi bi-plus"></i></button>
                        </div>
                    </td>
                    <td class="text-end fw-bold">${formatPrice(itemSubtotal)}</td>
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-sm remove-from-cart-btn" data-product-id="${item.id}" title="Remove item"><i class="bi bi-trash-fill"></i></button>
                    </td>
                </tr>
            `;
        });

        cartTableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        cartItemsContainer.innerHTML = cartTableHTML;

        cartSummaryContainer.innerHTML = `
            <div class="bg-white shadow-sm rounded p-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="mb-0">Total:</h4>
                    <h4 class="cart-total-price mb-0">${formatPrice(total)}</h4>
                </div>
                <div class="d-grid gap-2">
                    <a href="checkout.html" class="btn btn-primary btn-lg">Proceed to Checkout</a>
                    <a href="products.html" class="btn btn-outline-secondary">Continue Shopping</a>
                </div>
            </div>
        `;

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                let newQuantity = parseInt(e.target.value);
                if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
                updateCartItemQuantity(productId, newQuantity);
            });
        });
        
        document.querySelectorAll('.quantity-decrease-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                const input = e.currentTarget.parentElement.querySelector('.quantity-input');
                let newQuantity = parseInt(input.value) - 1;
                if (newQuantity < 1) newQuantity = 1;
                updateCartItemQuantity(productId, newQuantity);
            });
        });

        document.querySelectorAll('.quantity-increase-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                const input = e.currentTarget.parentElement.querySelector('.quantity-input');
                let newQuantity = parseInt(input.value) + 1;
                updateCartItemQuantity(productId, newQuantity);
            });
        });


        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetButton = e.target.closest('.remove-from-cart-btn');
                if (targetButton) {
                    const productId = parseInt(targetButton.dataset.productId);
                    removeFromCart(productId);
                }
            });
        });
    }

    function updateCartItemQuantity(productId, quantity) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1 && quantity > 0) {
            cart[itemIndex].quantity = quantity;
        } else if (quantity <= 0) { 
            cart.splice(itemIndex, 1);
        }
        saveCart(cart);
        loadCartPage(); 
        if(document.getElementById('checkout-order-summary')){ 
            loadCheckoutSummary();
        }
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
        loadCartPage(); 
        if(document.getElementById('checkout-order-summary')){ 
            loadCheckoutSummary();
        }
    }
    
    function loadCheckoutSummary() {
        if (!checkoutOrderSummaryContainer || !checkoutTotalContainer) return;

        const cart = getCart();
        checkoutOrderSummaryContainer.innerHTML = ''; 
        checkoutTotalContainer.innerHTML = '';
        
        let total = 0;
        if (cart.length === 0) {
            checkoutOrderSummaryContainer.innerHTML = '<li class="list-group-item text-muted">Your basket is empty.</li>';
            document.querySelector('.cart-count-summary').textContent = 0;
            if (checkoutForm) {
                const placeOrderButton = checkoutForm.querySelector('button[type="submit"]');
                if (placeOrderButton) placeOrderButton.disabled = true;
            }
            checkoutTotalContainer.innerHTML = `
                <li class="list-group-item d-flex justify-content-between bg-light">
                    <span class="fw-bold">Total (PHP)</span>
                    <strong>${formatPrice(0)}</strong>
                </li>
            `;
            return;
        }

        if (checkoutForm) {
            const placeOrderButton = checkoutForm.querySelector('button[type="submit"]');
            if (placeOrderButton) placeOrderButton.disabled = false;
        }

        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;
            const summaryItem = `
                <li class="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                        <h6 class="my-0">${item.name} <span class="text-muted small">(x${item.quantity})</span></h6>
                    </div>
                    <span class="text-muted">${formatPrice(itemSubtotal)}</span>
                </li>
            `;
            checkoutOrderSummaryContainer.innerHTML += summaryItem;
        });
        
        checkoutTotalContainer.innerHTML = `
            <li class="list-group-item d-flex justify-content-between bg-light">
                <span class="fw-bold">Total (PHP)</span>
                <strong>${formatPrice(total)}</strong>
            </li>
        `;
         document.querySelector('.cart-count-summary').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function handleFormValidation(form) {
        if (!form) return;
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    }
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', event => {
            event.preventDefault(); 
            event.stopPropagation();

            let isPaymentSelected = false;
            document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
                if (radio.checked) isPaymentSelected = true;
            });

            const paymentErrorEl = document.getElementById('payment-error');
            if (!isPaymentSelected && paymentErrorEl) {
                paymentErrorEl.style.display = 'block'; 
                 checkoutForm.classList.remove('was-validated'); 
            } else if (paymentErrorEl) {
                paymentErrorEl.style.display = 'none';
            }

            if (checkoutForm.checkValidity() && isPaymentSelected) {
                const orderSuccessModalElement = document.getElementById('orderSuccessModal');
                if (orderSuccessModalElement) {
                    const orderSuccessModal = new bootstrap.Modal(orderSuccessModalElement);
                    orderSuccessModal.show();
                    
                    localStorage.removeItem('gulayAtPrutasCart');
                    updateCartCount();
                    checkoutForm.reset();
                    checkoutForm.classList.remove('was-validated');
                    loadCheckoutSummary(); 

                    document.getElementById('close-success-modal').addEventListener('click', () => {
                        window.location.href = 'index.html';
                    });
                     orderSuccessModalElement.addEventListener('hidden.bs.modal', () => {
                        window.location.href = 'index.html';
                    });
                }
            } else {
                 checkoutForm.classList.add('was-validated');
            }
        });
    }

    if (contactForm) {
        const contactSuccessMessage = document.getElementById('contact-success-message');
        contactForm.addEventListener('submit', event => {
            event.preventDefault(); 
            event.stopPropagation();
            
            if (contactForm.checkValidity()) {
                if (contactSuccessMessage) {
                    contactSuccessMessage.style.display = 'block';
                }
                contactForm.reset();
                contactForm.classList.remove('was-validated');
                
                setTimeout(() => {
                    if (contactSuccessMessage) {
                        contactSuccessMessage.style.display = 'none';
                    }
                }, 5000);
            }
            contactForm.classList.add('was-validated');
        });
    }

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    if (featuredProductsContainer) {
        const featured = products.filter(p => p.featured).slice(0, 4); 
        displayProducts(featuredProductsContainer, featured);
    }

    if (allProductsContainer) {
        displayProducts(allProductsContainer, products);
    }

    if (cartItemsContainer) {
        loadCartPage();
    }
    
    if (checkoutOrderSummaryContainer) {
        loadCheckoutSummary();
    }
    
    handleFormValidation(checkoutForm); 
    handleFormValidation(contactForm);  

    updateCartCount(); 
});