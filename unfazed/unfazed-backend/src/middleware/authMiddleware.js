import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if(!authorization?.startswith("Bearer")) {
            return res.status(401).json({
                message: "Please log in to continue"
            });
        }

        const token = authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.therapistId = decoded.id;
        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired login token"
        });
    }
};