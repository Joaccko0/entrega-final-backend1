import express from "express";
import ProductManager from "../managers/ProductManager.js";

// Instanciamos el router de express para manejar las rutas
const productsRouter = express.Router();
// Instanciamos el manejador de nuestro archivo de productos
const productManager = new ProductManager("./src/data/products.json");

productsRouter.get("/", async (req, res) => {
    try {
      const data = await productManager.getProducts();
      res.status(200).send(data);
    } catch (error) {
      res.status(500).send({ message: error.message })
    }
  })
  
  productsRouter.get("/:pid", async (req, res) => {
    try {
      const products = await productManager.getProductById(req.params.pid);
      res.status(200).send(products);
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  });
  
  productsRouter.post("/", async (req, res) => {
    try {
      const newProduct = req.body;
      const product = await productManager.addProduct(newProduct);
      req.app.get('io').emit('new-product', product);
      res.status(201).send(product);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  productsRouter.put("/:pid", async (req, res) => {
    try {
      const updatedProduct = req.body;
      const products = await productManager.updateProduct(req.params.pid, updatedProduct);
      res.status(200).send(products);
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  });
  
  productsRouter.delete("/:pid", async (req, res) => {
    try {
      await productManager.deleteProductById(req.params.pid);
      req.app.get('io').emit('delete-product', pid);
      res.status(200).send({ message: `Producto con id: ${req.params.pid} eliminado` });
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  });
  
export default productsRouter;