import fs from "fs";
const path = require('path');

class CartManager {
    #path;
  
    constructor(filename = 'carts.json') {
      this.#path = path.join(__dirname, '..', 'data', filename);
    }
  
    async #readFile() {
      try {
        const data = await fs.readFile(this.#path, 'utf-8');
        return JSON.parse(data);
      } catch (err) {
        return [];
      }
    }
  
    async #writeFile(carts) {
      await fs.writeFile(this.#path, JSON.stringify(carts, null, 2));
    }
  
    async #generateId(carts) {
      const maxId = carts.reduce((max, cart) => cart.id > max ? cart.id : max, 0);
      return maxId + 1;
    }
  
    async createCart() {
        try {
            const carts = await this.#readFile();
            const newCart = {
                id: await this.#generateId(carts),
                products: []
            };
            carts.push(newCart);
            await this.#writeFile(carts);
            return newCart;
        }
        catch(error){
            throw new Error(`Error al crear el Carrito: ${error.message}`);
        }
    }
  
    async getCartById(id) {
        try {
            const carts = await this.#readFile();
            const cart = carts.find(c => c.id === parseInt(id));
            if (!cart) throw new Error('Carrito no encontrado');
            return cart;
        }
        catch (error) {
        throw new Error(`Error al obtener el carrito: ${error.message}`);
        }
    }
  
    async addProductToCart(cartId, productId) {
        try {
            const carts = await this.#readFile();
            const cartIndex = carts.findIndex(c => c.id === parseInt(cartId));
            if (cartIndex === -1) throw new Error('Carrito no encontrado');
        
            const productIndex = carts[cartIndex].products.findIndex(p => p.product === parseInt(productId));
            if (productIndex !== -1) {
                carts[cartIndex].products[productIndex].quantity += 1;
            } else {
                carts[cartIndex].products.push({ product: parseInt(productId), quantity: 1 });
            }
        
            await this.#writeFile(carts);
            return carts[cartIndex];
        }
        catch (error) {
            throw new Error(`Error al añadir productos al carrito: ${error.message}`);
        }
    }
}
  
module.exports = CartManager;