import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { relogRequestHandler } from '../../middleware/request-middleware';
import { UserResponse } from '../../models/UserResponse';

interface QueryParams {
  quizId?: string;
}

const getQuizzWapper: RequestHandler = async (req, res) => {
  try {
    const { quizId } = req.query as QueryParams;
    const { id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(quizId) || mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid Quiz ID or User Id format' });
    }

    const quizResponse = await UserResponse.findOne({ quizId, userId }).exec();

    if (!quizResponse) {
      return res.status(404).json({ message: 'Quiz response not found' });
    }
    return res.status(200).json(quizResponse.toJSON());
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getQuizResponse = relogRequestHandler(getQuizzWapper);
