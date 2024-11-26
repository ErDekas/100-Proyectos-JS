class StorageService {
  constructor() {
    this.storage = localStorage;
  }

  saveCart(cart) {
    this.storage.setItem("cart", JSON.stringify(cart));
  }

  getCart() {
    const cart = this.storage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  }

  clearCart() {
    this.storage.removeItem("cart");
  }
}
