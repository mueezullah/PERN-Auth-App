import * as authService from "./auth.service.js";

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const result = await authService.signupUser(name, username, email, password);

    
    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await authService.fetchAllUsers();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await authService.updateUserRole(id, role);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const toggleKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { kycVerified } = req.body;
    const result = await authService.toggleKycStatus(id, kycVerified);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

