const express = require("express");
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kg7cyoc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCullection = client.db("onlineShop").collection("products");
    const brandsName = client.db("onlineShop").collection("brands");
    const myCart = client.db("onlineShop").collection("cart");
    const topratedItems = client.db("onlineShop").collection("toprated");
    // Send a ping to confirm a successful connection


    app.get('/brands', async (req, res) => {
      const result = await brandsName.find().toArray()
      res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await productCullection.findOne(query);
      res.send(result);
    })

    app.get('/products', async (req, res) => {
      console.log(req.query)
      const query = { brand_name: req.query?.name };
      const result = await productCullection.find(query).toArray()
      res.send(result);
    })
    app.get('/toprated', async (req, res) =>{
      const query = {rating: {$gte:req.query?.rating}};
      const option = {projection:{name:1, image:1, price:1}};
      const result = await topratedItems.find(query, option).toArray();
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const query = req.body;
      const result = await productCullection.insertOne(query);
      res.send(result);
    })

    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const item = req.body;
      const option = {upsert:true};
      const updatedItem = {
        $set:{
          name:item.name,
          image:item.image,
          price:item.price,
          rating:item.rating,
          product_id:item.product_id,
          brand_name:item.brand_name
        }
      }
      const result = await productCullection.updateOne(filter,updatedItem,option)
      res.send(result);
    })

    app.post('/cart', async (req, res) => {
      const product = req.body;
      const result = await myCart.insertOne(product);
      res.send(result);
    })

    app.get('/cart', async (req, res) => {
      const result = await myCart.find().toArray();
      res.send(result);
    })

    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myCart.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("server is running")
})
app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})