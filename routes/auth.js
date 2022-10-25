const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs')

const router = express.Router();


router.post('/login',(req,res)=>{
    res.json({ hello: "login" })
})

router.post('/register',async (req,res) =>{
    const {username, password,email} = req.body;

    if(!username){
        return res.status(400).json({message: "Username is missing"});
    }
    if(!password){
        return res.status(400).json({message: "Password is missing"});
    }
    if(!email){
        return res.status(400).json({message: "Email is missing"});
    }
    else{
        const ExistUser = await User.findOne({username});
        if(ExistUser){
            return res.status(400).json({message: "Username already taken"});
        }
        bcrypt.hash(password, 12, async (err, passwordHash)=>{
            if(err){
                return res.status(500).json({success:"false", message: "Couldnt hash the password"}); 
            }
            else if(passwordHash){
                const newUser = new User({username, password:passwordHash, email})
                try {
                    await newUser.save()
                }catch(err){
                    return res.status(500).json({success:"false", message: "Couldnt create user"}); 
                }
                return res.json({ success:"true", message: "Register successfully", username, password, email})
            }
        }) 
    }
    
})

module.exports = router