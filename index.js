const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud.zsfl5hi.mongodb.net/?retryWrites=true&w=majority&appName=simple-crud`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const itemCollection = client.db("itemDB").collection("item");
    const userCollection = client.db("itemDB").collection("users");

    app.get("/item", async (req, res) => {
      const cursor = itemCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // all item
    app.get("/all-item", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await itemCollection.findOne(qurey);
      res.send(result);
    });

    app.post("/item", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedItem = req.body;

      const item = {
        $set: {
          name: updatedItem.name,
          category: updatedItem.category,
          description: updatedItem.description,
          price: updatedItem.price,
          rating: updatedItem.rating,
          stock: updatedItem.stock,
          imageurl: updatedItem.imageurl,
        },
      };

      const result = await itemCollection.updateOne(filter, item, option);
      res.send(result);
    });

    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });

    // Users related apis
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("Creating new user", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(newUser);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedDoc = {
        $set: {
          lastLogInTime: req.body?.lastLogInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("XtremeKits server is running");
});

app.listen(port, () => {
  console.log(`XtremeKits server is running on port: ${port}`);
});
