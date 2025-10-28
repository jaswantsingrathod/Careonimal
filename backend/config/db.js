import mongoose from "mongoose";
async function ConfigureDB() {
    try{
        await mongoose.connect(process.env.DB_URL)
        console.log("Connected to careonimal DB");
    }catch(err){
        console.log(`error connecting to server ${err.message}`);
    }
}

export default ConfigureDB