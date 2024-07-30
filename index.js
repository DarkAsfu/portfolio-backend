const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://ashrafulislam:${process.env.db_pass}@cluster0.gqju11e.mongodb.net/?appName=Cluster0`;

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
    // await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const projectsCollection = client.db("ashrafulislamDB").collection("projects");

    // Create an index on the projectTitle field
    await projectsCollection.createIndex({ projectTitle: 1 });

    app.get("/projects", async (req, res) => {
      const cursor = projectsCollection.find().sort({ _id: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/project/:title", async (req, res) => {
      try {
        const title = req.params.title;
        const query = { projectTitle: title }; // Use title directly as a string
        const result = await projectsCollection.findOne(query);
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).send("Project not found");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/projects", async (req, res) => {
      const project = req.body;
      const result = await projectsCollection.insertOne(project);
      res.send(result);
      console.log(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // Uncomment the following line if you want to close the client after the operations
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
