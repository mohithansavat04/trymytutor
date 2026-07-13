const Role = require('../models/Role');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const existing = await Role.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Role already exists' });
    }
    const role = new Role({ name, permissions });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    if (role.isSystem) {
      return res.status(403).json({ message: 'Cannot update system role' });
    }

    role.name = name || role.name;
    if (permissions) role.permissions = permissions;
    
    await role.save();
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (role.isSystem) {
      return res.status(403).json({ message: 'Cannot delete system role' });
    }

    await role.deleteOne();
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
