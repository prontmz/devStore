// cart.js - versão robusta (event delegation + localStorage + overlay)

(function () {
  // --- Config ---
  const STORAGE_KEY = "devstore_cart_v1";

  // --- Estado ---
  let cartItems = [];

  // --- Helpers DOM ---
  function $(sel, root = document) { return root.querySelector(sel); }
  function $all(sel, root = document) { return Array.from((root || document).querySelectorAll(sel)); }

  // --- Criar painel do carrinho e overlay (se não existir) ---
  function ensureCartUI() {
    if (!$(".cart-panel")) {
      const panel = document.createElement("div");
      panel.className = "cart-panel";
      panel.innerHTML = `
        <div class="cart-header">
          <h2>Carrinho</h2>
          <button class="close-cart" aria-label="Fechar carrinho">×</button>
        </div>
        <ul class="cart-items"></ul>
        <div class="cart-footer">
          <div class="cart-summary">
            <span class="cart-total-label">Itens: <strong class="cart-total-count">0</strong></span>
          </div>
          <button class="checkout-btn">Finalizar Compra</button>
          <button class="clear-cart-btn" style="margin-top:8px;background:#f5f5f5;color:#333;border:1px solid #ddd;">Limpar Carrinho</button>
        </div>
      `;
      document.body.appendChild(panel);
    }

    if (!$(".cart-overlay")) {
      const ov = document.createElement("div");
      ov.className = "cart-overlay";
      document.body.appendChild(ov);
    }
  }

  // --- LocalStorage ---
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cartItems = raw ? JSON.parse(raw) : [];
    } catch (e) {
      cartItems = [];
    }
  }
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }

  // --- Render ---
  function updateCartCountUI() {
    const countEls = $all(".cart-count");
    const n = cartItems.length;
    countEls.forEach(el => el.textContent = n);
    // update internal summary if exists
    const totalCount = $(".cart-total-count");
    if (totalCount) totalCount.textContent = n;
  }

  function renderCartPanel() {
    const list = $(".cart-items");
    if (!list) return;
    list.innerHTML = "";
    if (cartItems.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Carrinho vazio";
      list.appendChild(li);
      updateCartCountUI();
      return;
    }

    cartItems.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div class="ci-left">
          <div class="ci-title">${escapeHtml(item.name)}</div>
          <div class="ci-meta">${item.category || ""} • ${item.price || ""}</div>
        </div>
        <div class="ci-right">
          <button class="remove-btn" data-index="${idx}" aria-label="Remover item">Remover</button>
        </div>
      `;
      list.appendChild(li);
    });
    updateCartCountUI();
  }

  // --- Segurança mínima para texto injetado ---
  function escapeHtml(s) {
    if (!s && s !== 0) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Ações do carrinho ---
  function addToCart(product) {
    // product: { name, price?, category? }
    cartItems.push(product);
    saveToStorage();
    renderCartPanel();
    flashCartIcon();
  }

  function removeFromCart(index) {
    if (index >= 0 && index < cartItems.length) {
      cartItems.splice(index, 1);
      saveToStorage();
      renderCartPanel();
    }
  }

  function clearCart() {
    cartItems = [];
    saveToStorage();
    renderCartPanel();
  }

  function toggleCart(open) {
    const panel = $(".cart-panel");
    const overlay = $(".cart-overlay");
    if (!panel || !overlay) return;
    const isOpen = panel.classList.contains("open");
    if (typeof open === "boolean") {
      if (open && !isOpen) {
        panel.classList.add("open");
        overlay.classList.add("active");
      } else if (!open && isOpen) {
        panel.classList.remove("open");
        overlay.classList.remove("active");
      }
    } else {
      panel.classList.toggle("open");
      overlay.classList.toggle("active");
    }
  }

  function flashCartIcon() {
    const icons = $all(".cart-icon");
    icons.forEach(icon => {
      icon.classList.add("flash");
      setTimeout(() => icon.classList.remove("flash"), 400);
    });
  }

  // --- Event listeners (delegation) ---
  function setupEventDelegation() {
    // Clicar em botão Comprar (event delegation)
    document.addEventListener("click", (e) => {
      const buyBtn = e.target.closest(".btn.btn-primary, .btn-primary");
      if (buyBtn) {
        // procurar o product-card mais próximo
        const card = buyBtn.closest(".product-card");
        if (card) {
          const nameEl = card.querySelector(".product-title");
          const priceEl = card.querySelector(".product-price");
          const catEl = card.querySelector(".product-category");
          const product = {
            name: nameEl ? nameEl.textContent.trim() : "Produto",
            price: priceEl ? priceEl.textContent.trim() : "",
            category: catEl ? catEl.textContent.trim() : ""
          };
          addToCart(product);
        }
        return; // stop further handling for this click
      }

      // abrir carrinho ao clicar no ícone
      const cartClick = e.target.closest(".cart-icon, .open-cart-btn");
      if (cartClick) {
        toggleCart(true);
        return;
      }

      // remover item do carrinho
      const removeBtn = e.target.closest(".remove-btn");
      if (removeBtn && removeBtn.dataset.index !== undefined) {
        const idx = parseInt(removeBtn.dataset.index, 10);
        removeFromCart(idx);
        return;
      }

      // fechar carrinho (botão X)
      if (e.target.closest(".close-cart")) {
        toggleCart(false);
        return;
      }

      // checkout
      if (e.target.closest(".checkout-btn")) {
        // aqui podes integrar método de pagamento; por agora apenas limpa e mostra alerta
        if (cartItems.length === 0) {
          alert("Carrinho está vazio.");
        } else {
          alert("Simulação de checkout: " + cartItems.length + " item(ns).");
          clearCart();
          toggleCart(false);
        }
        return;
      }

      // limpar carrinho
      if (e.target.closest(".clear-cart-btn")) {
        if (confirm("Limpar todo o carrinho?")) clearCart();
        return;
      }

      // fechar ao clicar fora (overlay)
      if (e.target.closest(".cart-overlay")) {
        toggleCart(false);
        return;
      }
    });
  }

  // --- Inicialização ---
  function initCart() {
    ensureCartUI();
    loadFromStorage();
    renderCartPanel();
    updateCartCountUI();
    setupEventDelegation();

    // Também actualiza contador no load (caso haja vários elementos .cart-count)
    document.addEventListener("DOMContentLoaded", updateCartCountUI);
  }

  // Executa a inicialização imediatamente
  initCart();

  // Expor utilitários no window (opcional) para debug
  window.DevStoreCart = {
    addToCart,
    removeFromCart,
    clearCart,
    getItems: () => cartItems.slice()
  };
})();
