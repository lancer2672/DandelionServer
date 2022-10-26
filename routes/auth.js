const express = require('express');
const User = require('../models/users');
const bcrypt = require('bcryptjs')
const jwt = require ('jsonwebtoken');
const router = express.Router();


router.post('/login',async (req,res)=>{
    const {username, password} = req.body;

    if(!username){
        return res.status(400).json({message: "username is missing"});
    }
    if(!password){
        return res.status(400).json({message: "password is missing"});
    }
    try{
        const ExistUser = await User.findOne({username})
        if(!ExistUser){
            return res.status(400).json({message: "user do not exist"});
        }
        else{
            bcrypt.compare(password, ExistUser.password , (err, compareRes) => {
                if (err) { // error while comparing
                    res.status(502).json({message: "error while checking user password"});
                } else if (compareRes) { // password match
                    const token = jwt.sign({ userId: ExistUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                    res.status(200).json({message: "user logged in", "token": token, user: ExistUser});
                } else { // password doesnt match
                    res.status(401).json({message: "password is incorrect"});
                };
            });
        }
    }catch(err){
        res.status(500).json({message: "SERVER ERROR"});
    }

    
})

router.post('/register',async (req,res) =>{
    const {username, password,email} = req.body;

    if(!username){
        return res.status(400).json({message: "username is missing"});
    }
    if(!password){
        return res.status(400).json({message: "password is missing"});
    }
    if(!email){
        return res.status(400).json({message: "email is missing"});
    }
    else{
        const ExistUser = await User.findOne({username});
        if(ExistUser){
            return res.status(400).json({message: "username already taken"});
        }
        bcrypt.hash(password, 12, async (err, passwordHash)=>{
            if(err){
                return res.status(500).json({success:"false", message: "couldnt hash the password"}); 
            }
            else if(passwordHash){
                const newUser = new User({username, password:passwordHash, email})
                try {
                    await newUser.save()
                }catch(err){
                    return res.status(500).json({success:"false", message: "couldnt create user"}); 
                }
                return res.json({ success:"true", message: "register successfully", username, password, email})
            }
        }) 
    }
    
})

module.exports = router