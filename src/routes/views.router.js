// src/routes/views.router.js
import express from "express";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js"; 

const viewsRouter = express.Router();

// Vista paginada de productos
viewsRouter.get("/", async (req, res) => {
  try {
    // Leé los mismos query params que en la API
    const { limit = 6, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {
      if (query === "disponible") filter.stock = { $gt: 0 };
      else filter.category = query;
    }

    let options = {
      page: Number(page),
      limit: Number(limit),
      lean: true,
    };
    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    const result = await ProductModel.paginate(filter, options);

    // Armamos el paginador para handlebars
    res.render("home", {
      products: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}` : null,
      nextLink: result.hasNextPage ? `/?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}` : null,
      sort,
      query
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de detalles de un producto
viewsRouter.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await ProductModel.findById(pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render("productDetail", { product });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de carrito
viewsRouter.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid).populate("products.product").lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.render("cartDetail", { cart });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default viewsRouter;