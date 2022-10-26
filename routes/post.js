const express = require('express');
const User = require('../models/users');
const Post = require('../models/posts')
const router = express.Router();
const verifyToken = require('./../middleware/veryfyToken')

router.post('/create', verifyToken, (req, res)=>{

})

router.post('/update', verifyToken, (req, res)=>{

})

router.post('/delete', verifyToken, (req, res)=>{

})

module.exports = router