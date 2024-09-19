import Joi from '@hapi/joi';
import { RequestHandler } from 'express';
import { UserResponse } from '../../models/UserResponse';
import { Quiz } from '../../models/Quiz';
import { relogRequestHandler } from '../../middleware/request-middleware';

export const submitQuizSchema = Joi.object().keys({
  userId: Joi.string().required(),
  quizId: Joi.string().required(),
  responses: Joi.array().items(
    Joi.object().keys({
      question: Joi.string().required(),
      selected_option: Joi.string().required()
    })
  ).required()
});

export const attemptQuizSchema = Joi.object().keys({
  userId: Joi.string().required(),
  quizId: Joi.string().required(),
  isAttempted: Joi.boolean().required()
});
const submitQuizWrapper: RequestHandler = async (req, res) => {
  try {
    const {
      userId, quizId, responses
    } = req.body;

    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Find if the user has already started this quiz attempt
    let userResponse = await UserResponse.findOne({ userId, quizId });

    let score = 0;

    responses.forEach((response: { question: string; selected_option: string }) => {
      const quizQuestion = quiz.questions.find(q => q.question === response.question);

      if (quizQuestion && quizQuestion.answer === response.selected_option) {
        score += 1;
      }
    });

    if (userResponse) {
      userResponse.responses = responses;
      userResponse.score = score;
      userResponse.isSubmitted = true;
      userResponse.isAttempted = true;
      userResponse.submittedOn = new Date();
      userResponse.updatedOn = new Date();
    } else {
      userResponse = new UserResponse({
        userId,
        quizId,
        responses,
        score,
        isSubmitted: true,
        isAttempted: true
      });
    }

    await userResponse.save();

    return res.status(201).json({
      message: 'Quiz submitted successfully!',
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: score,
      userResponse: userResponse.toJSON()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

const attemptQuizWrapper: RequestHandler = async (req, res) => {
  try {
    const {
      userId, quizId, isAttempted
    } = req.body;

    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }
    const userResponse = await UserResponse.findOne({ userId, quizId });
    userResponse.isAttempted = isAttempted;
    userResponse.updatedOn = new Date();

    await userResponse.save();

    // Return the score and saved response
    return res.status(201).json({
      message: 'Quiz submitted successfully!',
      totalQuestions: quiz.questions.length,
      userResponse: userResponse.toJSON()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const attemptQuiz = relogRequestHandler(attemptQuizWrapper, { validation: { body: attemptQuizSchema } });
export const submitQuiz = relogRequestHandler(submitQuizWrapper, { validation: { body: submitQuizSchema } });
