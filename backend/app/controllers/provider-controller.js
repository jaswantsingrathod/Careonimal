import Provider from "../models/provider-models.js";
import User from "../models/user-model.js";
const ProviderController = {};
import { providerValidation, providerUpdateValidation } from "../validations/provider-validation.js";

ProviderController.create = async (req, res) => {
  try {
    const { error, value } = providerValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const existingProvider = await Provider.findOne({ user: req.userId });
    if (existingProvider) {
      return res
        .status(400)
        .json({ error: "Provider profile already exists for this user." });
    }
    let imageUrl = "";
    if (req.file && req.file.path) {
      imageUrl = req.file.path; // Cloudinary auto adds URL
    }
    const provider = new Provider({
      ...value,
      user: req.userId, // attach user ID from token
      image: imageUrl
    });
    await provider.save();
     await User.findByIdAndUpdate(provider.user, { role: "provider" });
    res
      .status(201)
      .json({ message: "Provider registered successfully", provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.list = async (req, res) => {
  const body = req.body;
  try {
    const users = await Provider.find(body);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.approve = async (req, res) => {
  try {
    const id = req.params.id;
    const provider = await Provider.findByIdAndUpdate(
      id,
      { approvedByAdmin: true },
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    res
      .status(200)
      .json({ message: "Provider approved successfully", provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.account = async (req, res) => {
  try {
    const id = req.params.id;
    const provider = await Provider.findById(id).populate(
      "user",
      "username email phone"
    );
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    res.status(200).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.modify = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const { error, value } = providerUpdateValidation.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const provider = await Provider.findByIdAndUpdate(
      { _id: id, user: req.userId }, // provider can update only their own profile
      value,
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ error: "Provider not found or unauthorized" });
    }
    if (req.file && req.file.path) {
      provider.image = req.file.path; // Update image if new file is uploaded
    } 
    await provider.save();
    res.status(200).json({ message: "Provider updated successfully", provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

ProviderController.remove = async (req, res) => {
  try{
    const id = req.params.id
    const provider = await Provider.findByIdAndDelete(id); // only admin can delete provider accounts
    if(!provider){
      return res.status(404).json({error:  "Provider not found or unauthorized"});
    }
     await User.findByIdAndUpdate(provider.user, { role: "user" });
    res.status(200).json({message: "Provider deleted successfully"});
  }catch(error){
    res.status(500).json({ error: error.message });
  }
}

ProviderController.delete = async (req, res) => {
  try {
    // Find and delete provider by logged-in user ID
    const provider = await Provider.findOneAndDelete({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "No provider profile found for this user" });
    }
    // Change role back to "user"
    await User.findByIdAndUpdate(req.userId, { role: "user" });
    res.status(200).json({ message: "Your provider profile has been deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider profile:", error);
    res.status(500).json({ error: error.message });
  }
};

export default ProviderController;
