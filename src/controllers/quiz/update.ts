import { RequestHandler } from 'express';
import Joi from '@hapi/joi';
import { Quiz } from '../../models/Quiz';
import { relogRequestHandler } from '../../middleware/request-middleware';

export const updateQuizSchema = Joi.object().keys({
  _id: Joi.string().required(),
  name: Joi.string(),
  description: Joi.string(),
  questions: Joi.array().items({
    question: Joi.string(),
    options: Joi.object().keys({
      a: Joi.string(),
      b: Joi.string(),
      c: Joi.string(),
      d: Joi.string()
    }),
    answer: Joi.string()
  })
});

const updateWrapper: RequestHandler = async (req, res) => {
  const { _id, ...updateData } = req.body;

  try {
    // Find the quiz by _id and update it
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    return res.status(200).json(updatedQuiz.toJSON());
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const update = relogRequestHandler(updateWrapper, { validation: { body: updateQuizSchema } });
