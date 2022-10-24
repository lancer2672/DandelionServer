const express = require('express')

const router = express.Router();


router.post('/login',(req,res)=>{
    res.json({ hello: "login" })
})

router.post('/register',(req,res) =>{
    const {username, password} = req.body;
    if(!username || !password){
        res.status(400).json({message: "username or password is missing"});
    }
    else{
        res.json({ username,password})
    }
   
})

module.exports = router