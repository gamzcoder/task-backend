import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Quiz } from '../../models/Quiz';

interface QueryParams {
    id?:string
  }
const deleteQuizWapper: RequestHandler = async (req, res) => {
  try {
    const { id } = req.query as QueryParams;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Quiz ID format' });
    }

    // Attempt to find and delete the quiz by ID
    const deletedQuiz = await Quiz.findByIdAndDelete(id).exec();

    // If the quiz does not exist
    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Return success response
    return res.status(200).json({ message: 'Quiz successfully deleted', deletedQuiz });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export default deleteQuizWapper;
