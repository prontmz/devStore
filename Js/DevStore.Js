// Selecionar elementos principais
const cartIcon = document.querySelector(".cart-icon");
const cartCount = document.querySelector(".cart-count");
const buyButtons = document.querySelectorAll(".btn.btn-primary");

// Criar o painel do carrinho (modal)
const cartPanel = document.createElement("div");
cartPanel.classList.add("cart-panel");
cartPanel.innerHTML = `
    <div class="cart-header">
        <h2>Carrinho</h2>
        <button class="close-cart">×</button>
    </div>
    <ul class="cart-items"></ul>
    <div class="cart-footer">
        <button class="checkout-btn">Finalizar Compra</button>
    </div>
`;
document.body.appendChild(cartPanel);

// Lista interna de produtos
let cartItems = [];

// Função para actualizar o painel
function updateCartDisplay() {
    const list = document.querySelector(".cart-items");
    list.innerHTML = "";

    if (cartItems.length === 0) {
        list.innerHTML = "<li class='empty'>Carrinho vazio</li>";
    } else {
        cartItems.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item;
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remover";
            removeBtn.classList.add("remove-btn");
            removeBtn.onclick = () => {
                cartItems.splice(index, 1);
                updateCartDisplay();
            };
            li.appendChild(removeBtn);
            list.appendChild(li);
        });
    }

    // Actualiza o número do carrinho
    cartCount.textContent = cartItems.length;
}

// Abrir e fechar o painel do carrinho
cartIcon.addEventListener("click", () => {
    cartPanel.classList.toggle("open");
});

cartPanel.querySelector(".close-cart").addEventListener("click", () => {
    cartPanel.classList.remove("open");
});

// Adicionar produtos ao carrinho
buyButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        const productCard = e.target.closest(".product-card");
        const productName = productCard.querySelector(".product-title").textContent;
        cartItems.push(productName);
        updateCartDisplay();
    });
});
