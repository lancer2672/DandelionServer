

const checkPermission = (permission) => {
    return (req, res, next) => {
      if (!req.objKey.permissions) {
        return res.status(403).json({
          message: "Permission Denied",
        });
      }
      const validPermission = req.objKey.permissions.includes(permission);
      if (!validPermission) {
        return res.status(403).json({
          message: "Permission Denied",
        });
      }

      return next();
    };
  };
module.exports = checkPermission