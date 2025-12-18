const mongoose=require('mongoose')
require('dotenv').config()
const mongoURI=process.env.mongoDBURI
console.log(mongoURI);
const conncetDb=async()=>{
    try{
const connect=await mongoose.connect(mongoURI)

console.log(`connection success ${connect.connection.name}`);

    }
    catch(error){
        console.log(error);
    }
}
module.exports=conncetDb


