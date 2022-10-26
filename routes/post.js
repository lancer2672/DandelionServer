const express = require('express');
const User = require('../models/users');
const Post = require('../models/posts')
const router = express.Router();
const verifyToken = require('./../middleware/veryfyToken')

router.post('/create', verifyToken, (req, res)=>{
    const {userId, title,description} = req.body
    const newPost = new Post({title, description,user:userId});
    newPost.save()
        .then(()=>{
            res.json({success:true, message:"create post successfully", newPost})            
        })
        .catch(err =>{
            res.status(400).json({success:false, message:"create post failed"})
        } )
})

router.get('/', verifyToken, (req, res)=>{
    const {userId} = req.body
    Post.find({user: userId})
        .then((posts)=>{
            res.json({success:true, message:"get all posts from user", posts})
        })
        .catch(err =>{
            res.status(400).json({success:false, message:"can not all posts"})
        })
})

router.put('/update', verifyToken, (req, res)=>{

})

router.post('/delete', verifyToken, (req, res)=>{

})

module.exports = router