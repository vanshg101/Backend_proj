// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config({
    path: "./.env"
});

connectDB()

.then(()=>{  
    app.on("error", (error) => {
        console.error("ERROR: ", error)
        throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);

        
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!", err);
    
})



















/*
 Just for demo purpose

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("DB Connected");

        app.on("error", (err) => {
            console.error("ERROR: ", error)
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`Listening on PORT: ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})()

*/