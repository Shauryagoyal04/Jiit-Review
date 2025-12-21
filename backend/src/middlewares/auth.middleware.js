import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized access: Token missing");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach minimal trusted data
    req.user = {
      userId: decoded.userId,
      campus: decoded.campus
    };

    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized access: Invalid or expired token");
  }
});

export default authMiddleware;
