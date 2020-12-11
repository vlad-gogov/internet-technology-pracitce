function dialog(param) {
    let pricetext = document.getElementById("price");
    pricetext.value = document.getElementById("product_price" + param).textContent.toString();

    let marktext = document.getElementById("mark");
    marktext.value = document.getElementById("product_mark" + param).textContent.toString();
}