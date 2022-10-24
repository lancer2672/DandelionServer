const express = require('express');
require('dotenv').config()
const  authRouter = require ('./routes/auth')
const mongoose = require('mongoose')

function connectDB() {
    try
    { mongoose.connect('mongodb+srv://lancer:JBdragonfire1135@dandelion.bswdcrh.mongodb.net/?retryWrites=true&w=majority');
    console.log("success")
    }
    catch(err){
        console.log("error")
    }
}
connectDB();
const app = express();
app.use(express.json())
app.use('/api/auth',authRouter)
app.get("/", (req, res) => res.send("hello"));


app.listen(process.env.PORT, ()=>console.log(`server started`))