const Feature = require("../../models/Feature");

const addFeatureImage = async (req, res) => {
  try {
    const { image, lookbookId } = req.body;

    const featureImages = new Feature({
      image,
      enabled: true,
      lookbookId: lookbookId || null,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, enabled, lookbookId } = req.body;

    const featureImage = await Feature.findByIdAndUpdate(
      id,
      { image, enabled, lookbookId },
      { new: true }
    );

    if (!featureImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: featureImage,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({}).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateFeatureImageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const featureImage = await Feature.findByIdAndUpdate(
      id,
      { enabled },
      { new: true }
    );

    if (!featureImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: featureImage,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;

    const featureImage = await Feature.findByIdAndDelete(id);

    if (!featureImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const reorderFeatureImages = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (Array.isArray(items)) {
      await Promise.all(
        items.map((item) =>
          Feature.findByIdAndUpdate(item.id, { order: item.order })
        )
      );
    }

    const images = await Feature.find({}).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  addFeatureImage,
  getFeatureImages,
  updateFeatureImageStatus,
  updateFeatureImage,
  deleteFeatureImage,
  reorderFeatureImages,
};
