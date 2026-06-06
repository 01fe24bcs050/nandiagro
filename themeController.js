const Theme = require('../models/Theme');

// @desc    Get active theme
// @route   GET /api/themes/active
// @access  Public
const getActiveTheme = async (req, res) => {
  try {
    let theme = await Theme.findOne({ isActive: true });
    if (!theme) {
      theme = {
        name: 'Default',
        isActive: true,
        colors: {
          darkGreen: '#6FB381',
          lightGreen: '#6FB381',
          golden: '#6FB381',
          textPrimary: '#000000',
          textSecondary: '#000000',
          bgColor: '#EDEDED',
          bodyBg: '#EDEDED',
        },
      };
    }
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all themes
// @route   GET /api/themes
// @access  Admin
const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find().sort({ createdAt: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new theme
// @route   POST /api/themes
// @access  Admin
const createTheme = async (req, res) => {
  try {
    const { name, colors } = req.body;
    const theme = await Theme.create({ name, colors });
    res.status(201).json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a theme
// @route   PUT /api/themes/:id
// @access  Admin
const updateTheme = async (req, res) => {
  try {
    const { name, colors } = req.body;
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    if (name) theme.name = name;
    if (colors) theme.colors = { ...theme.colors.toObject(), ...colors };

    await theme.save();
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a theme
// @route   DELETE /api/themes/:id
// @access  Admin
const deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    await theme.deleteOne();
    res.json({ message: 'Theme deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set a theme as active
// @route   PUT /api/themes/:id/activate
// @access  Admin
const setActiveTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    await Theme.updateMany({}, { isActive: false });
    theme.isActive = true;
    await theme.save();

    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveTheme,
  getAllThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  setActiveTheme,
};
