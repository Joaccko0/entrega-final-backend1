import express from "express";
import { ProductModel } from "../models/product.model.js";

// Instanciamos el router de express para manejar las rutas
const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
    try {
      // Leer query params con valores por defecto
      const {
        limit = 10,
        page = 1,
        sort,
        query
      } = req.query;

      // Filtro para búsqueda (por categoría o disponibilidad)
      let filter = {};
      if (query) {
        // Si la query es "disponible", buscar productos con stock > 0
        if (query === "disponible") {
          filter.stock = { $gt: 0 };
        } else {
          // Si no, buscar por categoría
          filter.category = query;
        }
      }

      // Opciones para paginate
      let options = {
        page: Number(page),
        limit: Number(limit),
        lean: true,
      };
      if (sort === "asc") options.sort = { price: 1 };
      if (sort === "desc") options.sort = { price: -1 };

      const result = await ProductModel.paginate(filter, options);
      const baseUrl = req.baseUrl + req.path; // /api/products
      const buildLink = (pageNum) =>
        `${baseUrl}?limit=${limit}&page=${pageNum}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`;

      res.json({
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
        nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  })
  
  productsRouter.get("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;

      // Busca el producto por su id (puede ser string u ObjectId)
      const product = await ProductModel.findById(pid).lean();

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: `Producto con id: ${pid} no encontrado`
        });
      }

      res.json({
        status: "success",
        payload: product
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });
  
  productsRouter.post("/", async (req, res) => {
    try {
      const { title, description, price, code, stock, category, thumbnails, status } = req.body;

      // Validación rápida de campos requeridos
      if (!title || !description || !price || !code || !stock || !category) {
        return res.status(400).json({
          status: "error",
          message: "Faltan campos obligatorios"
        });
      }

      // Crear producto (si thumbnails no se manda, usar [])
      const newProduct = await ProductModel.create({
        title,
        description,
        price,
        code,
        stock,
        category,
        thumbnails: thumbnails || [],
        status: status !== undefined ? status : true
      });

      res.status(201).json({
        status: "success",
        payload: newProduct
      });
    } catch (error) {
        // Error de código duplicado
        if (error.code === 11000) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un producto con ese código"
          });
        }
        res.status(500).json({
          status: "error",
          message: error.message
        });
      }
  });
  
  productsRouter.put("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;
      const updateFields = req.body;

      // Evitar que modifiquen el _id o id
      if (updateFields._id) delete updateFields._id;
      if (updateFields.id) delete updateFields.id;

      // Evitar actualizar el code a uno que ya existe
      if (updateFields.code) {
        const exists = await ProductModel.findOne({ code: updateFields.code, _id: { $ne: pid } });
        if (exists) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un producto con ese código"
          });
        }
      }

      // El { new: true } hace que te devuelva el producto actualizado
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        pid,
        updateFields,
        { new: true, runValidators: true, lean: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado"
        });
      }

      res.json({
        status: "success",
        payload: updatedProduct
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  });
  
  productsRouter.delete("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;

      const deletedProduct = await ProductModel.findByIdAndDelete(pid);

      if (!deletedProduct) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado"
        });
      }

      res.json({
        status: "success",
        message: `Producto con id: ${pid} eliminado`
      });
    } catch (error) {
        res.status(500).json({
          status: "error",
          message: error.message
        });
    }
  });
  
export default productsRouter;