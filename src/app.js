import express from "express";
import productsRouter from "./routes/products.router.js";
import cartRouter from "./routes/cart.router.js";
import viewsRouter from "./routes/views.router.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import ProductManager from "./managers/ProductManager.js";
import { connectDB } from "./config/db.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");
app.set('io', io);

// Puerto del servidor
const PORT = 8081;
app.use(express.json());
app.use(express.static("public"));

// Endpoints
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);

// Websockets
const productManager = new ProductManager("./src/data/products.json");
io.on("connection", (socket)=> {
  console.log("Nuevo usuario conectado");
});

// Nos conectaoms a la BD e iniciamos el servidor y escuchamos en el puerto definido
connectDB();
server.listen(PORT, ()=> console.log(`Servidor corriendo en: http://localhost:${PORT}`) );