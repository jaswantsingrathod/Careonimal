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
import { authenticateUser } from "./app/middlewares/authenticate-user.js";
import { authorizeUser } from "./app/middlewares/authorize-user.js";


app.post('/users/register', UserController.register)
app.post('/users/login', UserController.login)
app.get('/users',authenticateUser, authorizeUser(["admin"]), UserController.list)
app.get('/user/account/:id', authenticateUser,authorizeUser(["admin"]),UserController.account)
app.put('/user/account/update/:id', authenticateUser, UserController.modify)
app.delete('/user/account/delete/:id', authenticateUser, authorizeUser(["admin"]), UserController.remove)


app.listen(port, () => {
  console.log(`careonimal server is running on port ${port}`);
});

