import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); 

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

import ConfigureDB from "./config/db.js";
ConfigureDB();

import uploadCloudinary from "./app/middlewares/upload-cloudinary.js";

import UserController from "./app/controllers/user-controller.js";
import ProviderController from "./app/controllers/provider-controller.js";
import BookingController from "./app/controllers/booking-controller.js";
import { authenticateUser } from "./app/middlewares/authenticate-user.js";
import { authorizeUser } from "./app/middlewares/authorize-user.js";


// app.get('/providers/nearby', ProviderController.nearby);
app.post('/users/register', UserController.register)
app.post('/users/login', UserController.login)
// Protected routes 
app.get('/users',authenticateUser, authorizeUser(["admin"]), UserController.list)
app.get('/user/account/:id', authenticateUser,authorizeUser(["admin"]), UserController.account)
app.put('/user/account/update/:id', authenticateUser, UserController.modify)
app.delete('/user/account/delete/:id', authenticateUser, authorizeUser(["admin"]), UserController.remove)

// service providers
app.post('/providers/register',authenticateUser,uploadCloudinary.single('image'), ProviderController.create)
app.get('/providers', authenticateUser, authorizeUser(["admin", "provider", "user"]), ProviderController.list)
app.get('/providers/:id', authenticateUser,authorizeUser(["provider"]), ProviderController.account)
app.put('/provider/approve/:id', authenticateUser, authorizeUser(["admin"]), ProviderController.approve)
app.put('/provider/account/update/:id', authenticateUser,authorizeUser(["provider", "admin"]),uploadCloudinary.single('image'), ProviderController.modify)
app.delete('/provider/account/remove/:id', authenticateUser, authorizeUser(["admin"]), ProviderController.remove)
app.delete('/provider/account/delete/:id', authenticateUser, authorizeUser(["provider"]), ProviderController.remove);

// bookings
app.post('/bookings/create', authenticateUser, authorizeUser(["user"]), BookingController.create);
app.get('/bookings', authenticateUser, authorizeUser(["user", "admin"]), BookingController.userBookings)
app.get('/bookings/provider', authenticateUser, authorizeUser(["provider"]), BookingController.providerBookings)
app.put('/bookings/status/:id', authenticateUser, authorizeUser(["provider"]), BookingController.updateStatus)
app.put('/bookings/cancel/:id', authenticateUser, authorizeUser(["user"]), BookingController.cancel)
app.delete('/bookings/delete/:id', authenticateUser, authorizeUser(["admin"]), BookingController.delete)

app.listen(port, () => {
  console.log(`careonimal server is running on port ${port}`);
});

