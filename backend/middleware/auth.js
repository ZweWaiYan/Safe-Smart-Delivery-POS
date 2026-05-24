import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  //Check if token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  try {
    //Verify the token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    

    // Save decoded data in req.user
    req.user = decoded;

    //Continue to the next middleware or route
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
