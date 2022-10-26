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
    status:{
        type:String,
        enum: ['To learn', 'learning', 'learnt']
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
})

module.exports = mongoose.model('post',PostSchema)