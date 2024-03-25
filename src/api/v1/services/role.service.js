const { Role, Permission } = require("../models/role.model");

class RoleService {
  static findById = async (id) => {
    const role = await Role.findById(id).lean();
    return role;
  };
}

class PermissionService {
  static findById = async (id) => {
    const permission = await Permission.findById(id).lean();
    return permission;
  };
}
module.exports = { PermissionService, RoleService };
