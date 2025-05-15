import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
    #path;

    constructor(filename = "products.json") {
        this.#path = path.join(__dirname, '..', 'data', filename);
    }

    // Lee el archivo
    async #readFile() {
        try {
            const data = await fs.readFile(this.#path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    // Escribe al archivo
    async #writeFile(data) {
        await fs.writeFile(this.#path, JSON.stringify(data, null, 2));
    }

    // getProducts
    async getProducts() {
        return await this.#readFile();
    }

    async getProductById(id) {
        try {
            const products = await this.#readFile();
            const product = products.find(p => p.id === parseInt(id));

            if (!product) throw new Error(`Producto con id: ${id} no encontrado`);
            return product;
        }
        catch(error) {
            throw new Error(`Error al obtener el producto: ${error.message}`);
        }
    }

    async addProduct(productData) {
        const products = await this.#readFile();
        
        // Evalúa si ya existe un producto con ese ID
        const exists = products.some(p => p.code === productData.code);
        if (exists) throw new Error('Ya existe un producto con ese código');

        if (!productData.title || !productData.description || !productData.price || !productData.code || !productData.stock || !productData.category) {
            throw new Error('Faltan campos obligatorios');
        }

        if (isNaN(productData.price)) throw new Error('Precio inválido');
        if (isNaN(productData.stock)) throw new Error('Stock inválido');
        
        try {
            const newId = await this.#generateId(products)
            const newProduct = { id: newId, ...productData, status: true, thumbnail: "" }
            products.push(newProduct);
            await this.#writeFile(products);
        
            return newProduct;
        }
        catch(error){
            throw new Error(`Error añadir el producto: ${error.message}`);
        }
    }

    async updateProduct(id, updatedFields) {
        const products = await this.#readFile();
        const index = products.findIndex(p => p.id == id);
        if (index === -1) throw new Error('Producto no encontrado');
    
        try {
            const updatedProduct = {
            ...products[index],
            ...updatedFields,
            };
        
            delete updatedProduct.id; // evitar que se sobreescriba el id
        
            products[index] = { ...products[index], ...updatedFields };
            await this.#writeFile(products);
        
            return products[index];
        }
        catch(error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }
    }

    async deleteProduct(id) {
        try {
            const products = await this.#readFile();
            const filtered = products.filter(p => p.id != id);
        
            if (filtered.length === products.length) {
                throw new Error('Producto no encontrado');
            }
        
            await this.#writeFile(filtered);
            return true;
        }
        catch(error) {
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }
    }

    // Genera un nuevo ID
    async #generateId(products) {
        const ids = products.map(p => p.id);
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }
}

export default ProductManager;