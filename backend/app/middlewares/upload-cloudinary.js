import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// setup cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: 'careonimal_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
})

const uploadCloudinary = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } }); // limit file size to 3MB
export default uploadCloudinary