const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const client = new MongoClient("mongodb://localhost:27017");

client.connect()
.then(() => {
    console.log("MongoDB Connected");
})
.catch(err => console.log(err));

const db = client.db("26csel01");
const users = db.collection("myprofile");


// ================= SIGNUP =================

app.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.send("All fields are required");
    }

    const existingUser = await users.findOne({ email });

    if (existingUser) {
        return res.send("Email already registered");
    }

    await users.insertOne({
        name,
        email,
        password
    });

    fs.writeFile(
        "users.txt",
        `New User: ${name} (${email})`,
        err => {
            if (err) console.log(err);
        }
    );

    res.send("Signup Successful");
});


// ================= LOGIN =================

app.post("/login", async (req, res) => {
    console.log("new login route running");
    try {
        const email = req.body.email.trim();
        const password = req.body.password;

        console.log("Email received:", email);

        const user = await users.findOne({ email: email });

        console.log("User found:", !!user);

        if (!user) {
            return res.send("Email not found");
        }

        if (user.password !== password) {
            return res.send("Password mismatch");
        }

        res.send("Login successful");
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});
app.get("/", (req, res) => {
    res.send("Server is running successfully");
});
app.listen(3000, () => {
    console.log("Server Running on Port 3000");
});