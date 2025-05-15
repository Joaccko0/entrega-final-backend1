import express from "express";
import { CartModel } from "../models/cart.model.js";

// Instanciamos el router de express para manejar las rutas
const cartRouter = express.Router();

cartRouter.post("/", async(req, res) => {
    try {
      const newCart = await CartModel.create({ products: [] });
      res.status(201).json({
        status: "success",
        payload: newCart
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });
  
  cartRouter.get("/:cid", async(req, res) => {
    try {
      const { cid } = req.params;

      const cart = await CartModel.findById(cid)
        .populate("products.product")
        .lean();

      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Carrito no encontrado"
        });
      }

      res.json({
        status: "success",
        payload: cart
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });
  
  cartRouter.post("/:cid/product/:pid", async(req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      const qty = quantity && quantity > 0 ? quantity : 1;

      // Busca el carrito
      const cart = await CartModel.findById(cid);
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Carrito no encontrado"
        });
      }

      // Busca si ya existe ese producto en el carrito
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === pid
      );

      if (productIndex !== -1) {
        // Si ya está, suma la cantidad
        cart.products[productIndex].quantity += qty;
      } else {
        // Si no está, lo agrega
        cart.products.push({ product: pid, quantity: qty });
      }

      await cart.save();

      // Populeamos para la respuesta
      await cart.populate("products.product");

      res.json({
        status: "success",
        payload: cart
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });

  cartRouter.get("/", async (req, res) => {
    try {
      const { limit = 10, page = 1 } = req.query;
      const result = await CartModel.paginate(
        {},
        { limit: Number(limit), page: Number(page), populate: "products.product", lean: true }
      );
      res.json({
        status: "success",
        ...result // incluye docs, totalDocs, totalPages, etc.
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });

  cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    try {
      const { cid, pid } = req.params;
  
      const cart = await CartModel.findById(cid);
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Carrito no encontrado"
        });
      }
  
      // Filtramos el producto a eliminar
      const initialLength = cart.products.length;
      cart.products = cart.products.filter(
        (p) => p.product.toString() !== pid
      );
  
      if (cart.products.length === initialLength) {
        return res.status(404).json({
          status: "error",
          message: "Producto no estaba en el carrito"
        });
      }
  
      await cart.save();
  
      res.json({
        status: "success",
        message: "Producto eliminado del carrito"
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });

  cartRouter.put("/:cid", async (req, res) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;
  
      if (!Array.isArray(products)) {
        return res.status(400).json({
          status: "error",
          message: "Debes enviar un array de productos"
        });
      }
  
      // Validar formato del array
      // Cada producto debe tener { product: <idProducto>, quantity: <número> }
      for (const item of products) {
        if (!item.product || typeof item.quantity !== "number" || item.quantity < 1) {
          return res.status(400).json({
            status: "error",
            message: "Formato incorrecto en algún producto"
          });
        }
      }
  
      const cart = await CartModel.findById(cid);
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Carrito no encontrado"
        });
      }
  
      cart.products = products;
      await cart.save();
      await cart.populate("products.product");
  
      res.json({
        status: "success",
        payload: cart
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });

  cartRouter.put("/:cid/products/:pid", async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
  
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({
          status: "error",
          message: "Cantidad inválida"
        });
      }
  
      const cart = await CartModel.findById(cid);
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Carrito no encontrado"
        });
      }
  
      const productInCart = cart.products.find(
        (p) => p.product.toString() === pid
      );
  
      if (!productInCart) {
        return res.status(404).json({
          status: "error",
          message: "Producto no está en el carrito"
        });
      }
  
      productInCart.quantity = quantity;
      await cart.save();
      await cart.populate("products.product");
  
      res.json({
        status: "success",
        payload: cart
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });  

  cartRouter.delete("/:cid", async (req, res) => {
    try {
      const { cid } = req.params;
  
      const cart = await CartModel.findById(cid);
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Carrito no encontrado"
        });
      }
  
      cart.products = [];
      await cart.save();
  
      res.json({
        status: "success",
        message: "Todos los productos han sido eliminados del carrito"
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });  
  
export default cartRouter;