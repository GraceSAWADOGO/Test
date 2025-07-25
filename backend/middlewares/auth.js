const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ error: "Authentication required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if(!user) throw new Error("User not found");
    
    // Exclure le mot de passe de l'objet utilisateur
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({error:"Please authenticate."})
  }
};

module.exports = auth
