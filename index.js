const express = require('express');
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors');
const multer = require('multer')
const authRouter = require ('./routes/auth')
const postRouter = require('./routes/post')

const User = require('./models/users');
const verifyToken = require('./middleware/veryfyToken');
function connectDB() {
    try
    { mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@dandelion.bswdcrh.mongodb.net/?retryWrites=true&w=majority`);
    console.log("connected to DB")
    }
    catch(err){
        console.log("can not connect to DB")
    }
}
connectDB();
const app = express();
app.use(express.json())
app.use(cors());
app.use('/api/auth',authRouter)
app.use('/post',postRouter)
app.get("/", (req, res) => res.send("hello"));
// app.post("/upload", (req, res) => {
//     upload(req, res, (err)=> {
//             if(err) console.log("Lỗi",err);
//             else {
//                 const {username} = req.body;
//                 const ExistUser = User.findOne(username)
//                 ExistUser.avatar.data = req.file.filename
//                 ExistUser.avatar.contentType = 'image/png'
//                 ExistUser.save()
//                 .then(()=>{console.log("Luu thanh cong")})
//                 .catch(err => {console.log("lỗi")})
//             }
//     })
// });
app.post("/upload1",verifyToken, (req, res) => {console.log("body",req.body)});

// const storage = multer.diskStorage({
//     destination: "uploads",
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
//   })
// const upload = multer({ storage: storage }).single('testImg');

app.listen(process.env.PORT, ()=>console.log(`server started`))