import Provider from "../models/provider-models.js";
const ProviderController = {};
import { providerValidation } from "../validations/provider-validation.js";

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
    const provider = new Provider({
      ...value,
      user: req.userId, // attach user ID from token
    });
    await provider.save();
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
    const provider = await Provider.findByIdAndUpdate(id,{ approvedByAdmin: true },
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
    const provider = await Provider.findById(id).populate("user", "username email phone");
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    res.status(200).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default ProviderController;
