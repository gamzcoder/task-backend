import { RequestHandler } from 'express';
import Joi from '@hapi/joi';
import { Quiz } from '../../models/Quiz';
import { relogRequestHandler } from '../../middleware/request-middleware';

export const addQuizSchema = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  questions: Joi.array().items({
    question: Joi.string().required(),
    options: Joi.object().keys({
      a: Joi.string().required(),
      b: Joi.string().required(),
      c: Joi.string().required(),
      d: Joi.string().required()
    }).required(),
    answer: Joi.string().required()
  })
});

const addWrapper: RequestHandler = async (req, res) => {
  try {
    const allquestions = req.body.questions;
    if (allquestions.length < 5) {
      return res.status(400).json({ message: 'Quiz must have 5 question.' });
    }
    const quiz = new Quiz({ ...req.body, createdBy: req.user.role });
    await quiz.save();

    return res.status(201).json(quiz.toJSON());
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const add = relogRequestHandler(addWrapper, { validation: { body: addQuizSchema }, requiredRoles: ['superAdmin', 'admin'] });
