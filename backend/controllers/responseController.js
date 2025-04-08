import SavedResponse from '../models/SavedResponse.js';

export const saveResponse = async (req, res) => {
  try {
    const { content, modified, originalContent } = req.body;
    
    const newResponse = new SavedResponse({
      content,
      user: req.user._id,
      modified,
      originalContent
    });

    await newResponse.save();

    res.status(201).json({
      success: true,
      data: newResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving response',
      error: error.message
    });
  }
};