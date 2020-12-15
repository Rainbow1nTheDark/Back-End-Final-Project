const mongoose = require("mongoose")

const Schema = mongoose.Schema;
mongoose.connect("mongodb://localhost/web322");
// define the company schema
var vehicleSchema = new Schema({
    "VIN":  {"type" : String,
            unique: true},
    "make": String,
    "model": String,
    "year": Number,
    "preOwned": Boolean,
    "price" : Number
  });
  
  var Vehicle = mongoose.model("Test5", vehicleSchema);
  
 
  var vehicle = new Vehicle({
    VIN : '1HGN45JXMN585',
    make: "Honda",
    model: "Civic",
    year: 2016,
    preOwned: true,
    price: 9800.00
  });
  
  
  vehicle.save()
  .then(() =>{
    
      console.log("good");
      process.exit();
  })
  .catch(err =>
  {
    console.log(err)
   
  })
        
         

 
  Vehicle.updateOne(
      {"VIN" : "1HGN45JXMN585"},
      {$set: {"model" : "CR-V"}}
  ).exec()
  .then(vehicle => console.log(vehicle))
  .catch(err=>
    {
      console.log(err)
    });
  
  


  