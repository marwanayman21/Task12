import { handleData, showCat } from "./shares/api.js";

const sideBarList = $('#ul');
const navCategories = $('#navCategories');
const num_of_item = $('#num_of_item');
let products = JSON.parse(localStorage.getItem('products'));

showCat(
    function(categories) {
        console.log(categories);
        sideBarList.html(categories.map(item => 
            `<li id='car_element'><a href="#" class='categories-list' id='${item.slug}'>${item.name}</a></li>`
        ).join(''));
        navCategories.html(categories.map(item => `<li id='${item.slug}'><a class="dropdown-item " href="#">${item.name}</a></li>`).join(''));
    }
)

const endPoint = 'products/category/beauty';
handleData(
    endPoint,
    function(data) {
        console.log('Fetched data:', data);
         data = data.products;
        const productContainer = $('#product-container');
        productContainer.html(data.map(product => `
<div class="col-12 col-sm-6 col-md-4">
    <div class="mb-2 card shadow rounded-3 p-3 d-flex flex-column ">
            <div class="img-container">
            <img class="card-img-top" src="${product.images[0]}" alt="${product.title}">
        </div>
          <div class= 'card-body'>
            <h1 class="card-title mb-3">${product.title}</h1>
            <p class="card-text">${product.description}</p>
             <div class="d-flex gap-2 mb-3 align-items-center">
                <span class="text-warning">★</span>
               <div class="px-2 bg-danger bg-opacity-75 rounded-2">${product.rating}</div>
              </div>
            <div class="card-end d-flex justify-content-between">
            <h3>$${product.price}</h3>
            <button class="btn btn-danger mb-3 addToCartBtn">Add To Cart</button>
        </div>
        </div>
        </div>
  
</div>
        `).join(''));
        attachAddToCartListeners();
    },
    error => console.log(error),
    () => $('.loading-overlay').fadeIn('slow'),
    () =>  $('.loading-overlay').fadeOut('slow')
)
$(document).on('click', '.categories-list', function() {
    const categoryId = $(this).attr('id');
    console.log(categoryId);

    if (categoryId) {
        handleData(
            `products/category/${categoryId}`,
            data => {
                console.log('Fetched data:', data);
                const productContainer = $('#product-container');
                productContainer.html(data.products.map(product => `
                    <div class="col-12 col-sm-6 col-md-4">
                        <div class="mb-2 card shadow rounded-3 p-3 d-flex flex-column">
                            <div class="img-container">
                                <img class="card-img-top" src="${product.images[0]}" alt="${product.title}">
                            </div>
                            <div class='card-body'>
                                <h1 class="card-title mb-3">${product.title}</h1>
                                <p class="card-text">${product.description}</p>
                                <div class="d-flex gap-2 mb-3 align-items-center">
                               <span class="text-warning">★</span>
                                <div class="px-2 bg-danger bg-opacity-75 rounded-2">${product.rating}</div>
                               </div>
                                <div class="card-end d-flex justify-content-between">
                                    <h3>$${product.price}</h3>
                                    <button class="btn btn-danger mb-3 addToCartBtn">Add To Cart</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join(''));
                attachAddToCartListeners();
            },
            error => console.log(error),
            () => $('.loading-overlay').fadeIn('slow'),
            () =>  $('.loading-overlay').fadeOut('slow')
        );
    }
});




function attachAddToCartListeners() {
    const $addToCartButtons = $('.addToCartBtn');
    const $cartItems = $('#cartItems');
    const $cartTotal = $('#cartTotal');

    let total = 0;

    $addToCartButtons.each(function() {
        $(this).on('click', function() {
            const $item = $(this).closest('.card');
            const img_path = $item.find('img').attr('src');
            const title = $item.find('h1').text();
            const price = parseFloat($item.find('h3').text().replace('$', ''));
            if (products == null) {
                products = [];
            }
            let existingProduct = products.find(product => product.title === title);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                let product = {
                    img_path: img_path,
                    title: title,
                    price: price,
                    quantity: 1
                };
                products.push(product);
            }
            updateCart();
        });
    });

    function updateCart() {
        $cartItems.empty();
        total = 0;
        num_of_item.html(products.length);
        products.forEach(product => {
            total += product.price * product.quantity;
            const $li = $('<li></li>').addClass('d-flex justify-content-between border-bottom pb-2 mb-2');
            $li.html(`
                <div class="d-flex">
                    <img src="${product.img_path}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    <span>${product.title}</span>
                </div>
                <div>
                    <button class="decrease-qty btn btn-sm btn-outline-secondary" data-title="${product.title}">-</button>
                    <span>${product.quantity}</span>
                    <button class="increase-qty btn btn-sm btn-outline-secondary" data-title="${product.title}">+</button>
                    <span>$${(product.price * product.quantity).toFixed(2)}</span>
                </div>
            `);
            $cartItems.append($li);
        });
        $cartTotal.text(total.toFixed(2));
        localStorage.setItem('products', JSON.stringify(products));
    }
    $cartItems.on('click', '.increase-qty', function() {
        const title = $(this).data('title');
        let product = products.find(product => product.title === title);
        if (product) {
            product.quantity += 1;
            updateCart();
        }
    });
    $cartItems.on('click', '.decrease-qty', function() {
        const title = $(this).data('title');
        let product = products.find(product => product.title === title);
        if (product) {
            if (product.quantity > 1) {
                product.quantity -= 1;
            } else {
                products = products.filter(product => product.title !== title);
            }
            updateCart();
        }
    });
    updateCart();
}

$(document).ready(function() {
    $('#toggleSidebar').on('click', function() {
        $('#categories').addClass('show');
    });
    $('#closeSidebar').on('click', function() {
        $('#categories').removeClass('show');
    });
    const $cartButton = $('#cartButton');
    const $closeCart = $('#closeCart');
    const $cart = $('#cart');
    $cartButton.on('click', function() {
        $cart.toggleClass('show');
    });
    $closeCart.on('click', function() {
        $cart.removeClass('show');
    });
});