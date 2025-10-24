// app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.render("home"));
app.get("/recommendations", (req, res) => res.render("recommendations"));
app.get("/meal-planner", (req, res) => res.render("meal-planner"));

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
