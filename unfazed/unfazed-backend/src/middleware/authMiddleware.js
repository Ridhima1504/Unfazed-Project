import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please log in to continue",
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid login token",
      });
    }

    req.therapistId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login token",
    });
  }
};