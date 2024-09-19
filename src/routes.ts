import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import apiSpec from '../swagger-doc.json';

import * as UserController from './controllers/user';
import * as AuthController from './controllers/auth';
import * as AdminController from './controllers/quiz';
import * as ResponseController from './controllers/response';
import { checkRole } from './middleware/request-middleware';

export const router = Router();

// Auth routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// User routes
router.get('/user/all', UserController.all);

router.post('/admin/quiz', AdminController.add);
router.get('/admin/quiz', AdminController.all);
router.get('/admin/quiz-details', AdminController.getQuiz);
router.put('/admin/quiz', AdminController.update);
router.delete('/admin/quiz', AdminController.deleteQuiz);
router.get('/admin/randomQuiz', AdminController.randomQuiz);

router.post('/quiz/start', ResponseController.startQuiz);
router.post('/quiz/submit', ResponseController.submitQuiz);
router.post('/quiz/attempt', ResponseController.attemptQuiz);
router.get('/quiz', ResponseController.getQuizResponse);

if (process.env.NODE_ENV === 'development') {
  router.use('/dev/api-docs', swaggerUi.serve);
  router.get('/dev/api-docs', swaggerUi.setup(apiSpec));
}
