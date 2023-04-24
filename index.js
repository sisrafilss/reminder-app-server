const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.quv1r.mongodb.net:27017,cluster0-shard-00-01.quv1r.mongodb.net:27017,cluster0-shard-00-02.quv1r.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-teugro-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("reminder_app");
    const remindersCollection = database.collection("reminders");

    // GET - all reminders
    app.get("/all-reminders/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = remindersCollection.find({ email: email });
      const reminders = await cursor.toArray();
      res.json(reminders);
    });

    // PUT - update task status
    app.put("/update-reminder-status", async (req, res) => {
      const updatedTask = req.body;

      const email = req.query?.email;
      const id = req.query?.id;

      const status = updatedTask?.status === "done" ? "pending" : "done";

      const result = await remindersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: status,
          },
        }
      );
      res.json(result);
    });

    // POST - Add a task to task list
    app.post("/add-task", async (req, res) => {
      const task = req.body;
      const result = await remindersCollection.insertOne(task);
      res.json(result);
    });

    // Delete - Delete a task
    app.delete("/task-list/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await remindersCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Reminder App server is running...");
});

app.listen(port, () => {
  console.log("Server has started at port", port);
});
