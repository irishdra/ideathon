const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: {type: String},
    date: {type: Date},
    author: { ref: "User", type: mongoose.Schema.Types.ObjectId },
},
    {
        versionKey: false
    }
);

const MessageModel = mongoose.model('Message', MessageSchema);

class Message
{
    static getAllUserMessages(idArray)
    {
        return MessageModel.find({_id: {$in: idArray}}).populate("author");
    }

    static getById(id)
    {
        return MessageModel.findById(id).populate("author");
    }

    static insert(us)
    {
        return new MessageModel(us).save();
    }

    static update(id, us)
    {
        return MessageModel.findByIdAndUpdate(id, us, {new: true, useFindAndModify: false});
    }

    static deleteById(id)
    {
        return MessageModel.findByIdAndDelete(id, {useFindAndModify: false});
    }

    static getByLogin(login)
    {
        return MessageModel.findOne({ login: login });
    }
 };
 
 module.exports = Message;
