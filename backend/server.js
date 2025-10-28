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

import UserController from "./app/controllers/user-controller.js";
import ProviderController from "./app/controllers/provider-controller.js";
import { authenticateUser } from "./app/middlewares/authenticate-user.js";
import { authorizeUser } from "./app/middlewares/authorize-user.js";


app.post('/users/register', UserController.register)
app.post('/users/login', UserController.login)

// Protected routes 
app.get('/users',authenticateUser, authorizeUser(["admin"]), UserController.list)
app.get('/user/account/:id', authenticateUser,authorizeUser(["admin"]), UserController.account)
app.put('/user/account/update/:id', authenticateUser, UserController.modify)
app.delete('/user/account/delete/:id', authenticateUser, authorizeUser(["admin"]), UserController.remove)

// service providers
app.post('/providers/register',authenticateUser, ProviderController.create)
app.get('/providers', authenticateUser, authorizeUser(["admin"]), ProviderController.list)
app.get('/providers/:id', authenticateUser, ProviderController.account)
app.put('/provider/approve/:id', authenticateUser, authorizeUser(["admin"]), ProviderController.approve)


app.listen(port, () => {
  console.log(`careonimal server is running on port ${port}`);
});

