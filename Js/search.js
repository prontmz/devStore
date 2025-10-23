// Captura elementos da barra de pesquisa
const searchInput = document.getElementById("product-search");
const searchButton = document.getElementById("search-btn");

// Ao clicar no botão "Buscar"
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query !== "") {
    // Redireciona para a página de produtos com o termo de pesquisa
    window.location.href = `produtos.html?search=${encodeURIComponent(query)}`;
  }
});

// Permitir Enter também
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});
