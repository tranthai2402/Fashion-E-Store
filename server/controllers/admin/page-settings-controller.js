const PageSettings = require("../../models/PageSettings");

const savePageSettings = async (req, res) => {
  try {
    const { pageName, data } = req.body;

    let settings = await PageSettings.findOne({ pageName });

    if (settings) {
      settings.data = data;
      await settings.save();
    } else {
      settings = new PageSettings({
        pageName,
        data,
      });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

const getPageSettings = async (req, res) => {
  try {
    const { pageName } = req.params;
    const settings = await PageSettings.findOne({ pageName });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = { savePageSettings, getPageSettings };
