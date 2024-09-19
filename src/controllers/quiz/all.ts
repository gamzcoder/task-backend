import { RequestHandler } from 'express';
import Joi from '@hapi/joi'; // Ensure you're using the right Joi package, as @hapi/joi is deprecated
import mongoose from 'mongoose';
import { Quiz, IQuiz } from '../../models/Quiz'; // Assuming `QuizDocument` is the Mongoose document type
import { relogRequestHandler } from '../../middleware/request-middleware';

interface QueryParams {
  id?:string
  page?: number;
  limit?: number;
  questionName?: string;
}

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  questionName: Joi.string().optional()
});

const getQuizzesWapper: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, questionName } = req.query as QueryParams;

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (questionName) {
      filter['questions.question'] = { $regex: new RegExp(questionName, 'i') };
    }

    const quizzes = await Quiz.find(filter)
      .skip(skip)
      .limit(limit)
      .exec() as IQuiz[];

    const totalQuizzes = await Quiz.countDocuments(filter).exec();

    const totalPages = Math.ceil(totalQuizzes / limit);

    return res.status(200).json({
      totalQuizzes,
      totalPages,
      currentPage: page,
      pageSize: limit,
      quizzes
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getQuizzWapper: RequestHandler = async (req, res) => {
  try {
    const { id } = req.query as QueryParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Quiz ID format' });
    }

    const quiz = await Quiz.findById(id).exec();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    return res.status(200).json(quiz);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getQuiz = relogRequestHandler(getQuizzWapper);

export const all = relogRequestHandler(getQuizzesWapper, { validation: { query: querySchema }, requiredRoles: ['superAdmin', 'admin'] });
