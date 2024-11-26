class ApiService {
  constructor() {
    this.baseUrl = "https://fakestoreapi.com/products";
  }

  async fetchProducts() {
    try {
      const response = await fetch(this.baseUrl);
      const products = await response.json();
      return products.map((product) => ({
        id: product.id,
        nombre: product.title,
        precio: product.price,
        imagen: product.image,
        descripcion: product.description,
        stock: Math.floor(Math.random() * 50) + 10, // Stock aleatorio
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }
}