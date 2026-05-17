const Page = require("../../models/Page");

const addOrUpdatePage = async (req, res) => {
  try {
    const { title, slug, content, metaTitle, metaDescription, isActive } = req.body;

    let page = await Page.findOne({ slug });

    if (page) {
      page.title = title;
      page.content = content;
      page.metaTitle = metaTitle;
      page.metaDescription = metaDescription;
      page.isActive = isActive;
      await page.save();
    } else {
      page = new Page({
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        isActive,
      });
      await page.save();
    }

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find({});
    res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

const deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = { addOrUpdatePage, getAllPages, getPageBySlug, deletePage };
