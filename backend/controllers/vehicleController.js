import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";

/*
    @desc    Add a new vehicle for the logged-in user
    @route   POST /api/vehicles
*/
export const addVehicle = async (req, res) => {
  try {
    const { licensePlate, brand, model, color } = req.body;
    
    // ดึง userId จาก middleware
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    // ตรวจสอบข้อมูลเกี่ยวกับรถว่าส่งมาครบไหม
    if (!licensePlate || !brand || !model) {
      return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    // ตรวจสอบคนนี้มีรถที่มีป้ายทะเบียนนี้อยู่แล้วหรือไม่ ถ้ามีแล้วจะไม่สามารถลงทะเบียนซ้ำได้
    const existingVehicle = await Vehicle.findOne({ licensePlate, userId: user._id });
    if (existingVehicle) {
      return res.status(409).json({ success: false, message: "ป้ายทะเบียนนี้ถูกลงทะเบียนแล้ว" });
    }

    const licensePlateTrimmed = licensePlate.trim().replace(/\s/g, "");

    // Check if this is the first vehicle - make it default
    const vehicleCount = await Vehicle.countDocuments({ userId: user._id });
    const isDefault = vehicleCount === 0;

    // เพิ่มข้อมูลรถคันใหม่
    const newVehicle = new Vehicle({
      licensePlate: licensePlateTrimmed,
      brand,
      model,
      color: color || '',
      userId: user._id,
      isDefault: isDefault
    });

    await newVehicle.save();

    res.status(201).json({ 
      success: true, 
      message: "เพิ่มยานพาหนะสำเร็จ", 
      data: {
        id: newVehicle._id,
        licensePlate: newVehicle.licensePlate,
        brand: newVehicle.brand,
        model: newVehicle.model,
        color: newVehicle.color,
        isDefault: newVehicle.isDefault
      } 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

/*
    @desc    Get all vehicles for the logged-in user
    @route   GET /api/vehicles
*/
export const getUserAllVehicles = async (req, res) => {
  try {
    // ดึง userId จาก middleware
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    // ค้นหาผู้ใช้จากฐานข้อมูล
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }
    
    // ค้นหารถทุกคันของผู้ใช้
    const vehicles = await Vehicle.find({ userId: user._id })
      .select("licensePlate brand model color isDefault createdAt")
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: vehicles.length, 
      data: vehicles.map(v => ({
        id: v._id,
        licensePlate: v.licensePlate,
        brand: v.brand,
        model: v.model,
        color: v.color || '',
        isDefault: v.isDefault || false,
        createdAt: v.createdAt
      }))
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

/*
    @desc    Update a vehicle
    @route   PUT /api/vehicles/:id
*/
export const updateVehicle = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { licensePlate, brand, model, color } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vehicle = await Vehicle.findOne({ _id: id, userId });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "ไม่พบยานพาหนะ" });
    }

    // Check if new license plate is already used by another vehicle
    if (licensePlate && licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await Vehicle.findOne({ 
        licensePlate, 
        userId, 
        _id: { $ne: id } 
      });
      if (existingVehicle) {
        return res.status(409).json({ success: false, message: "ป้ายทะเบียนนี้ถูกลงทะเบียนแล้ว" });
      }
    }

    // Update fields
    if (licensePlate) vehicle.licensePlate = licensePlate.trim().replace(/\s/g, "");
    if (brand) vehicle.brand = brand;
    if (model) vehicle.model = model;
    if (color !== undefined) vehicle.color = color;

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: "อัปเดตยานพาหนะสำเร็จ",
      data: {
        id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        isDefault: vehicle.isDefault
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

/*
    @desc    Delete a vehicle
    @route   DELETE /api/vehicles/:id
*/
export const deleteVehicle = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vehicle = await Vehicle.findOne({ _id: id, userId });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "ไม่พบยานพาหนะ" });
    }

    const wasDefault = vehicle.isDefault;
    await Vehicle.deleteOne({ _id: id });

    // If deleted vehicle was default, set another vehicle as default
    if (wasDefault) {
      const anotherVehicle = await Vehicle.findOne({ userId });
      if (anotherVehicle) {
        anotherVehicle.isDefault = true;
        await anotherVehicle.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "ลบยานพาหนะสำเร็จ"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

/*
    @desc    Set vehicle as default
    @route   PUT /api/vehicles/:id/default
*/
export const setDefaultVehicle = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vehicle = await Vehicle.findOne({ _id: id, userId });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "ไม่พบยานพาหนะ" });
    }

    // Remove default from all other vehicles
    await Vehicle.updateMany(
      { userId, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this vehicle as default
    vehicle.isDefault = true;
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: "ตั้งเป็นยานพาหนะหลักสำเร็จ",
      data: {
        id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        isDefault: vehicle.isDefault
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
};