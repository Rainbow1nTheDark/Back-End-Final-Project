const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
mongoose.Promise = global.Promise

const userSchema = new Schema({
    "email" : {"type" : String,
                unique: true},
    "username" : String,
    "password" : String,
    "firstName" : String,
    "lastName" : String,
    "isAdmin" : {
        default : false,
        type: Boolean
    }
})
const roomSchema = new Schema(
    {
        "hotel": String,
        "town": String,
        "description" : String,
        "price": Number,
        "rating": String ,
        "name": {type: String,
                unique: true}  
    }
)
//register user module
let User;
let Rooms;
module.exports.updateRoom = (filename, data) =>
{
    return new Promise((resolve, reject)=>
    {
        console.log(filename)
        Rooms.updateOne({hotel: filename}, 
            {$set: {town: data.city.toUpperCase(), description: data.description, price: data.price, rating: data.rating}})
        .exec()
        .then(room =>
            {
                console.log("Updated room: " + room)
                resolve();
            })
        .catch(err=> reject(err))
    })
}
module.exports.getRoom = (filename) =>
{
    return new Promise((resolve, reject)=>
    {
        Rooms.find({hotel: filename})
        .exec()
        .then((room)=>
        {
            console.log("Room in getRoom: " + room);
            
            resolve(room[0].toObject())
        })
        .catch((err)=>
        {
            reject(err)
        })
    })
}
module.exports.removeRoom = (filename) => 
{
    return new Promise((resolve, reject) =>
    {
        Rooms.deleteOne({hotel: filename})
        .exec()
        .then(image =>
            {
                console.log("image" + image)
                resolve(image)
            })
            .catch(err =>
                {
                    reject(err)
                })
    })
}
module.exports.getRooms = () =>
{
    return new Promise((resolve, reject) =>
    {
        Rooms.find({})
        .exec()
        .then(data =>
            {
                let rooms = data.map(room => room.toObject())
                
                resolve(rooms)
            })
        .catch(err =>
            {
                reject(err)
            })
    })
}
module.exports.getRoomsInCity = (city) =>
{
    return new Promise((resolve, reject) =>
    {
        Rooms.find({town: city.toUpperCase()})
        .exec()
        .then(data =>
            {
                let rooms = data.map(room => room.toObject())
                
                resolve(rooms)
            })
        .catch(err =>
            {
                reject(err)
            })
    })
}
module.exports.saveRoom = (room) =>
{
    return new Promise((resolve, reject) =>
    {
        let roomToSave = new Rooms(
            {
                hotel: room.file.filename,
                town: room.body.city.toUpperCase(),
                description : room.body.description,
                price: room.body.price,
                rating: room.body.rating,
                name: room.body.name   
            })
           
            roomToSave.save()
            .then((savedRoom) =>
            {
                resolve(savedRoom)
            })
            .catch(err => 
                {
                    reject(err)
                })
    })
}
module.exports.connectDB = (dbConnection) =>
{
    return new Promise((resolve, reject)=>
    {
        const db = mongoose.createConnection(dbConnection, 
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex:true
            })
            db.on('error', err=>
            {
                reject(err)
            })
            db.once('open', ()=>
            {
                Rooms = db.model('rooms', roomSchema, 'rooms')
                User = db.model('users', userSchema, 'users')
                resolve()
            })
    })
}
module.exports.createNewUser = (userData) =>{
    
return new Promise((resolve, reject)=>{
    bcrypt.hash(userData.psw, 10)
    .then(hash=>{
        userData.psw = hash
        let newUser = new User({
            email : userData.email,
            username : userData.username,
            password : userData.psw,
            firstName : userData.firstName,
            lastName : userData.lastName,
        })
        
    
    newUser.save((err, addedUser)=>
    {
        if(err)
        {
            if(err.code == 11000)
                reject("Email is already taken");
            else
                reject("Error: " + err)
        }
        else
            resolve(addedUser.email);
    })
    
})
}).catch(err =>{
    console.log("Encryption error: " + err);
})  
}
module.exports.findExistingUser = (userData) =>{
    return new Promise((resolve, reject)=>
    {
      
        User.findOne({email : userData.email})
        .exec()
        .then(user =>{
            const jsUserData = user.toObject();
            
            bcrypt.compare(userData.psw, jsUserData.password)
            .then((result)=>
            {
                if(result)
                {
                   
                    if(jsUserData.email.includes('airbnb.ca'))
                        jsUserData.isAdmin = true;
                    resolve(jsUserData)    
                }
                else
                {
                  
                    let error = {email : "", password : "Wrong password, please try again"}
                    reject(error);
                }
            })
        })
        .catch(err =>{
        
            let error = {email : "No user found with provided email", password : ""}
            reject(error);
        })
    })
   
}