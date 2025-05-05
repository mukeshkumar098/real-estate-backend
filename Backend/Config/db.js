import mongoose from "mongoose";




const dbConnected=async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URL)
        console.log("db Connected ssuccessfully");
        
    } catch (error) {
        console.log(error,"error while connecting db");

        
    }
}
export {dbConnected}