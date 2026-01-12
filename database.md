# Database Reference (MarketTatylu)

This document summarizes the MongoDB database design used by this project (collections, key fields, and relationships), and shows safe, reusable connection string examples you can copy into other projects.

---

## 1) Connection strings and usage 🔧

- Environment variable used by the server: **`MONGODB_URI`**
- Default local connection (used in `.env.example`):

```
MONGODB_URI=mongodb+srv://juhuh3001_db_user:Espe123@cluster0.olchaay.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

- MongoDB Atlas (SRV) example (replace placeholders):

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
``` 

Notes and best practices:
- **Do not commit real credentials**. Store the connection string in environment variables (e.g., `.env`) or in your deployment service secrets.
- If your password contains special characters, URL-encode it (e.g., `@` → `%40`).
- For Atlas, you can use the `mongodb+srv` scheme which uses DNS seedlists and requires less configuration for hosts.
- Recommended Mongoose connection options (used in this project):

```js
await mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

---

## 2) Collections & Schemas overview ✅

The project defines the following Mongoose models (one collection per model by default):

- **Product** (`products` collection)
  - Fields: `nombre` (String), `precio` (Number), `categoria` (String), `stock` (Number), `descuento` (Number), `imagen` (String), `descripcion` (String), `fechaCreacion` (Date), `fechaModificacion` (Date)
  - Virtual `id` maps to `_id`

- **User** (`users` collection)
  - Fields: `id` (mixed), `nombre` (String, required), `apellido`, `email` (unique), `passwordHash`, `isAdmin` (Boolean), `emailVerified`, `emailVerificationToken`, `cedula`, `telefono`, `photo`, `fechaRegistro`, `cart` (Array), `orders` (Array)

- **Order** (`orders` collection)
  - Fields: `id` (String, human-friendly sequential id), `userId` (ObjectId ref `User`), `items` (Array), `resumen` (Object), `estado` (String, default `pendiente`), `fecha` (Date)
  - `id` is generated using an internal `Sequence` document for incremental counters

- **Review** (`reviews` collection)
  - Fields: `productId` (ObjectId ref `Product`), `userId` (ObjectId ref `User`), `name`, `email`, `rating` (1–5), `title`, `body`, `approved` (Boolean), `createdAt` (Date)

- **Supplier** (`suppliers` collection)
  - Fields: `proveedor`, `contacto`, `celular`, `categorias` (Array), `rating`, `pedidos`, `createdAt`, `updatedAt` (updated on save)

- **Report** (`reports` collection)
  - Fields: `id` (String, sequential), `tipo` (daily/weekly/monthly/yearly/snapshot), `periodoInicio`, `periodoFin`, `generadoEn`, `totalVentas`, `totalOrdenes`, `totalProductosVendidos`, `topProductos` (array of top product subdocs), `ventasPorCategoria` (object), `notas`
  - `id` is created using `Sequence` just like `Order`

- **Sequence** (`sequences` collection)
  - Fields: `name` (String, unique), `value` (Number)
  - Used as a simple counter store for generating human-friendly sequential ids (orders & reports)

---

## 3) Relationships & important behaviors 🔗

- Orders reference `User` by `userId` (ObjectId). Reviews reference `Product` and `User` by ObjectId.
- The `id` fields on Orders/Reports are *sequential, human-friendly* ids implemented using the `Sequence` model.
- Product `stock` and sales information are maintained in the app logic when orders complete; validate stock before decrementing.

---

## 4) How to reuse this DB in other projects (quick guide) 💡

1. Create a `.env` file in the new project and add:

```
MONGODB_URI=mongodb://localhost:27017/el-valle
```

2. Install Mongoose:

```
npm install mongoose
```

3. Copy the model schemas you need (`server/models/*.js`) into your project and import them:

```js
const mongoose = require('mongoose');
const Product = require('./models/Product');

await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
```

4. If you need the same sequential ids for orders/reports, copy over the `Sequence` model and the `pre('save')` logic used to derive `order.id` and `report.id`.

5. Secure credentials and avoid committing `.env`.

---

## 5) Migration / Seeding notes

- The server contains convenience seeding for a few default `Product`s and a dev `admin` user used during development. Remove or guard seed logic before production deployments.
- For data migrations, write scripts that use Mongoose models and run them separately (example: `server/scripts/find-orphan-orders.js`).

---

## 6) Troubleshooting & tips ⚠️

- Connection errors: ensure `MONGODB_URI` is correct and network access / IP whitelist (for Atlas) is configured.
- Atlas: use a database user with least privileges needed for the app and rotate credentials regularly.
- Production: prefer TLS (Atlas uses it by default) and use proper secrets management (not checked into git).

---

If you want, I can also:
- generate small example `.env.example` and README snippets for other projects,
- or add a `database-schema.md` that includes sample JSON documents for each collection.

---

© MarketTatylu — Database Reference
