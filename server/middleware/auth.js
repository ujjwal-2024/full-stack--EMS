import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" }); // ✅ Bug 1 fixed
    }

    const token  = authHeader.split(" ")[1];
    req.user     = jwt.verify(token, process.env.JWT_SECRET);   // ✅ Bug 2 fixed, Bug 3 removed
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const protectAdmin = (req, res, next) => {
  protect(req, res, () => {                                      // ✅ Bug 4 fixed — runs protect first
    if (req.user.role.toLowerCase() !== "admin") {              // ✅ Bug 5 fixed — case-insensitive
      return res.status(403).json({ message: "Forbidden. Admins only." });
    }
    next();
  });
};
