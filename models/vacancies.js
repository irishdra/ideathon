const mongoose = require('mongoose');

const VacancySchema = new mongoose.Schema({
    company: {type: String},
    message: {type: String},
    date: {type: Date},
    email: {type: String},
    test: {type: String},
    topic: {type: String}
},
    {
        versionKey: false
    }
);

const VacancyModel = mongoose.model('Vacancy', VacancySchema);

class Vacancy
{
    static getAllUserVacancys(top)
    {
        return VacancyModel.find({topic: top});
    } 

    static getAll()
    {
        return VacancyModel.find();
    } 

    static getById(id)
    {
        return VacancyModel.findById(id);
    }

    static insert(us)
    {
        return new VacancyModel(us).save();
    }

    static update(id, us)
    {
        return VacancyModel.findByIdAndUpdate(id, us, {new: true, useFindAndModify: false});
    }

    static deleteById(id)
    {
        return VacancyModel.findByIdAndDelete(id, {useFindAndModify: false});
    }

    static getByLogin(login)
    {
        return VacancyModel.findOne({ login: login });
    }
 };
 
 module.exports = Vacancy;
