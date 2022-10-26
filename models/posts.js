const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Tao model

const PostSchema = new Schema({
    title: {
        type:String,
        required: true
    },
    description:{
        type:String,
        required: true,
    },
    url:{
        type:String,
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    
},{timestamps: true})

module.exports = mongoose.model('post',PostSchema)