import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../../utils/sendMail.js";
import User from "../models/user-model.js";
const UserController = {};
import { userLoginValidation, userRegisterValidation } from "../validations/user-validation.js";

UserController.register = async (req, res) => {
  const body = req.body;
  try {
    const { error, value } = userRegisterValidation.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const userByEmail = await User.findOne({ email: value.email });
    if (userByEmail) {
      return res.status(400).json({ error: "email already exist" });
    }
    const user = new User(req.body);
    const salt = await bcryptjs.genSalt();
    const hash = await bcryptjs.hash(user.password, salt);
    user.password = hash;
    const userCount = await User.countDocuments();
    if (userCount == 0) {
      user.role = "admin";
    }
    await user.save();
    await sendMail(
      user.email,
      "Welcome to Careonimal 🐾",
      `
      <h2>Hi ${user.username},</h2>
      <p>Thank you for registering on <b>Careonimal.com</b></p>
      <p>You can now explore pet services like vets, groomers, and boarding centers.</p>
      <br>
      <p>Best wishes,<br>The Careonimal Team</p>
      `
    );
    res.status(201).json("Registered successfully",user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

UserController.login = async (req, res) => {
    const body = req.body
    const { error, value } = userLoginValidation.validate(body, { abortEarly: false })
    if (error) {
        return res.status(400).json({ error: error.message })
    }
    const user = await User.findOne({ email: value.email })
    if (!user) {
        return res.status(401).json({ error: 'Invalid email / password' })
    }
    const passwordMatch = await bcryptjs.compare(value.password, user.password)
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email / password' })
    }

    await User.findByIdAndUpdate(user._id, { $inc: { loginCount: 1 } })
    const tokenData = { userId: user._id, role: user.role };
    console.log(tokenData);
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '30d' })

    // only logged in users data
    const userDetais = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    // admin logs in send all users
    if(user.role === "admin"){
      const allUsers = await User.find().sort({createdAt: -1})
      return res.status(200).json({token,
        user: userDetais,
        users: allUsers})
    }

    return res.status(200).json({ token, user: userDetais });
}

UserController.list = async (req, res) => {
  const body = req.body;
  try {
    const users = await User.find(body);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

UserController.account = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user by ID, exclude password
    const user = await User.findById(userId)

    // If not found, handle gracefully
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user account:", err);
    res.status(500).json({ error: err.message });
  }
};


UserController.modify = async (req, res) => {
  try {
    const id = req.params.id
    const body = req.body
    const updatedUser = await User.findByIdAndUpdate(id,body, {
      new: true,         
      runValidators: true 
    });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

UserController.remove = async (req, res) => {
  try {
    const id = req.params.id
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json("account deleted successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default UserController