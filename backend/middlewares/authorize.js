/**
 * Middleware d'autorisation basé sur les rôles
 * @param {...string} allowedRoles - Rôles autorisés à accéder à la ressource
 * @returns {Function} Middleware Express
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    // Vérification du type avant conversion
    const userRole = String(req.user.role).toLowerCase();
    const allowedRolesLower = allowedRoles.map(role => 
      String(role).toLowerCase()
    );

    if (!allowedRolesLower.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden: You don't have permission to access this resource",
        details: {
          userRole: req.user.role,
          allowedRoles
        }
      });
    }
    next();
  };
};

module.exports = authorize;