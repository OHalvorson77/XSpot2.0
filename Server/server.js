const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const stripe = require("stripe")("sk_test_51Nv36tEcibrMWRS9UEP5gJQzaTG2KyUEy9YQhN8bXXVHOZZ3k3b3rrb1z0PaFmjZAbTWYwQtRgNiyNl2jAIybVEO00Yb7MqCOl"); // Replace with your Stripe secret key
const bodyParser = require("body-parser");
require("dotenv").config()


const app = express();
const port = 8000; // or any port of your choice

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hockey@2003",
  database: "petappwebsite",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error: " + err.message);
  } else {
    console.log("Connected to the database");
  }
});

// Route to get a product by ID
app.get("/products/:id", (req, res) => {
  const productId = req.params.id;
  const query = "SELECT * FROM product WHERE id = ?";
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("SQL query error: " + err.message);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results[0]);
    }
  });
});
app.get("/products/", (req, res) => {
    
    const query = "SELECT * FROM product";
    db.query(query, (err, results) => {
      if (err) {
        console.error("SQL query error: " + err.message);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(results);
      }
    });
  });

// Route to get similar products (replace with your logic)
app.get("/products/similar/:category", (req, res) => {
    const productId = req.params.category;
    const query = "SELECT * FROM product WHERE category = ?";
    db.query(query, [productId], (err, results) => {
      if (err) {
        console.error("SQL query error: " + err.message);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(results);
      }
    });
});

app.post("/payment/", cors(), async (req, res)=>{
  let {amount, id} =req.body 
  try{
    const payment=await stripe.paymentIntents.create({
      amount,
      currency: "CAD",
      description: "Spatula company",
      payment_method: id, 
      confirm: true,
      return_url: "http://localhost:3000/"
    })
    console.log ("Payment", payment)
    res.json({
      message: "Payment successful",
      success: true,
      return_url: payment.next_action?.redirect_to_url?.url || "http://localhost:3000/",
    })

  }catch (error){
    console.log("ERROR", error)
    res.json({
      message: "payment failed",
      success: false
    })

  }
   
})

app.get("/", (req, res) => {
    res.send("Hello, World!"); // or any other response you want
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function calculateTotalAmount(items) {
  // Calculate the total amount based on the items in the cart
  return items.reduce((total, item) => {
    return total + item.price * item.qty;
  }, 0);
}