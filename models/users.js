const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    //Спільні ознаки
    login: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    password_hash: { type: String, required: true},
    email:{type: String, required: true},
    isDisabled: { type: Boolean },
    role: { type: Number },
    avaUrl: { type: String },
    bio: { type: String },

    //Абитурієнт
    messages: { type: Array },

    //Студент
    ticket:{type:String},
    topics:{type:Array},
    certificates: { type: Array },
    speciality:{type: String},

    //Університет
    name:{type: String},
    telephone:{type: Number},
    time:{type: String},
    },
    {
        versionKey: false
    });

const UserModel = mongoose.model('User', UserSchema);
class User
{
    static getQuantityOfUsers(searchword)
    {
        return UserModel.find({login: {$regex: `(?i).*${searchword}.*(?-i)`}}).countDocuments();
    }

    static getAll(searchword, skp, lm)
    {
        return UserModel.find({login: {$regex: `(?i).*${searchword}.*(?-i)`}}).skip(skp).limit(lm);
    }

    static getAllAbits()
    {
        return UserModel.find({role: 1});
    }

    static getAllUnivs()
    {
        return UserModel.find({role: 3});
    }

    static getById(id)
    {
        return UserModel.findById(id);
    }

    static insert(us)
    {
        return new UserModel(us).save();
    }

    static update(id, us)
    {
        return UserModel.findByIdAndUpdate(id, us, {new: true, useFindAndModify: false});
    }

    static deleteById(id)
    {
        return UserModel.findByIdAndDelete(id, {useFindAndModify: false});
    }

    static getByLogin(login)
    {
        return UserModel.findOne({ login: login });
    }
 };
 
 module.exports = User;
