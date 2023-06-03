const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB starts
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dc2rluc.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		await client.connect();

		// collection
		const taskCollection = client.db('task-manager-app').collection('tasks');

		// add new task
		app.post('/new-task', async (req, res) => {
			const newTask = req.body;
			console.log(newTask);
			const result = await taskCollection.insertOne(newTask);
			res.send(result);
		});

		// get all tasks
		app.get('/all-tasks', async (req, res) => {
			const result = await taskCollection.find().toArray();
			res.send(result);
		});

		// get tasks by category
		app.get('/tasks', async (req, res) => {
			const filter = req.query.filter;
			const query = { status: filter };
			const result = await taskCollection.find(query).toArray();
			res.send(result);
		});

		// delete a task
		app.delete('/task/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await taskCollection.deleteOne(query);
			res.send(result);
		});

		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

// mongoDB ends

app.get('/', (req, res) => {
	res.send('Task Manager server is working...');
});

app.listen(port, () => {
	console.log('Server is running on - port:', port);
});
