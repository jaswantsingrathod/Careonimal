import Provider from "../models/provider-models.js";
import User from "../models/user-model.js";
import { sendMail } from "../../utils/sendMail.js";
const ProviderController = {};
import {
  providerValidation,
  providerUpdateValidation,
} from "../validations/provider-validation.js";

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
      image: imageUrl,
    });
    await provider.save();
    await User.findByIdAndUpdate(provider.user, { role: "provider" });

    const user = await User.findById(req.userId);
    //  Send confirmation mail
    await sendMail(
      user.email,
      "Welcome to Careonimal 🐾",
      `
      <h2>Hi ${user.username},</h2>
      <p>Thank you for registering your service <b>${provider.businessName}</b> as a ${provider.serviceType} provider on <b>Careonimal.com</b></p>
      <p>Our team will review and approve your profile soon.</p>
      <br>
      <p>Warm regards,<br>Careonimal Team</p>
      `
    );
    res.status(201).json({
      message: "Provider registered successfully. Confirmation mail sent.",
      provider,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.list = async (req, res) => {
  try {
    const { city, serviceType, petType, businessName } = req.query;

    // Role-based filter
    const filters = {};
    if (req.role !== "admin") {
      filters.approvedByAdmin = true;
    }

    // Apply search filters
    if (city) filters.city = { $regex: city, $options: "i" };
    if (serviceType) filters.serviceType = serviceType;
    if (businessName)
      filters.businessName = { $regex: businessName, $options: "i" };
    if (petType)
      filters["servicesOffered.petType"] = { $regex: petType, $options: "i" };

    const providers = await Provider.find(filters)
      .populate("user", "username email")
      .select("-__v")
      .sort({ createdAt: -1 });

    if (!providers.length) {
      return res.status(404).json({ message: "No providers found" });
    }

    res.status(200).json(providers);
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
      return res
        .status(404)
        .json({ error: "Provider not found or unauthorized" });
    }
    if (req.file && req.file.path) {
      provider.image = req.file.path; // Update image if new file is uploaded
    }
    await provider.save();
    res
      .status(200)
      .json({ message: "Provider updated successfully", provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

ProviderController.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const provider = await Provider.findByIdAndDelete(id); // only admin can delete provider accounts
    if (!provider) {
      return res
        .status(404)
        .json({ error: "Provider not found or unauthorized" });
    }
    await User.findByIdAndUpdate(provider.user, { role: "user" });
    res.status(200).json({ message: "Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

ProviderController.delete = async (req, res) => {
  try {
    // Find and delete provider by logged-in user ID
    const provider = await Provider.findOneAndDelete({ user: req.userId });
    if (!provider) {
      return res
        .status(404)
        .json({ error: "No provider profile found for this user" });
    }
    // Change role back to "user"
    await User.findByIdAndUpdate(req.userId, { role: "user" });
    res
      .status(200)
      .json({ message: "Your provider profile has been deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider profile:", error);
    res.status(500).json({ error: error.message });
  }
};

ProviderController.nearby = async (req, res) => {
  try {
    const latParam = req.query.lat || req.query.latitude;
    const lngParam = req.query.lng || req.query.long || req.query.longitude;
    const radius = parseFloat(req.query.radius) || 15; // km

    const serviceType = req.query.serviceType; // vet / groomer / boarding
    const petType = req.query.petType; // dog / cat / etc

    const userLat = parseFloat(latParam);
    const userLong = parseFloat(lngParam);

    if (isNaN(userLat) || isNaN(userLong)) {
      return res.status(400).json({
        error: "Valid numeric latitude (lat) and longitude (lng) are required",
      });
    }

    const query = {
      approvedByAdmin: true,
    };

    if (serviceType) {
      query.serviceType = serviceType;
    }

    if (typeof petType === "string" && petType.trim().length > 0) {
      query.servicesOffered = {
        $elemMatch: {
          petType: {
            $regex: `^${petType.trim()}$`,
            $options: "i",
          },
        },
      };
    }

    // Fetch only matching providers
    const providers = await Provider.find(query).lean();

    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;

    const calcDistanceKm = (lat1, lon1, lat2, lon2) => {
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearby = providers
      .map((prov) => {
        const lat2 = prov.location?.latitude;
        const lon2 = prov.location?.longitude;

        if (lat2 == null || lon2 == null) return null;

        const distance = calcDistanceKm(userLat, userLong, lat2, lon2);

        return {
          ...prov,
          distance: Number(distance.toFixed(2)),
        };
      })
      .filter((p) => p && p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      message: `Providers within ${radius} km`,
      count: nearby.length,
      providers: nearby,
    });
  } catch (err) {
    console.error("Nearby error:", err);
    res.status(500).json({ error: err.message });
  }
};

export default ProviderController;
