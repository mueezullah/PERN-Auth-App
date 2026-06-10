import * as authService from "./auth.service.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signupUser(name, email, password);

    
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
