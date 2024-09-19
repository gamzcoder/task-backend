import { RequestHandler } from 'express';
import Joi from '@hapi/joi';

import { relogRequestHandler } from '../../middleware/request-middleware';
import { UserResponse } from '../../models/UserResponse';

export const startQuizSchema = Joi.object().keys({
  quizId: Joi.string().required()
});

const startQuizWrapper: RequestHandler = async (req, res) => {
  try {
    const { quizId } = req.body;
    const { id: userId } = req.user;

    const existingResponse = await UserResponse.findOne({ userId, quizId });

    if (existingResponse) {
      return res.status(400).json({ message: 'Quiz attempt already exists for this user.' });
    }

    const userResponse = new UserResponse({
      userId,
      quizId,
      isAttempted: false,
      isSubmitted: false,
      responses: [],
      score: 0,
      createdOn: new Date()
    });

    await userResponse.save();

    return res.status(201).json(userResponse.toJSON());
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const startQuiz = relogRequestHandler(startQuizWrapper, { validation: { body: startQuizSchema } });
