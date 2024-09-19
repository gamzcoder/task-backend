import { RequestHandler } from 'express';
import Joi from '@hapi/joi';
import jwt from 'jsonwebtoken';
import { relogRequestHandler } from '../../middleware/request-middleware';
import { User } from '../../models/User';

export const addUserSchema = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().required()
});

const registerWrapper: RequestHandler = async (req, res) => {
  const {
    email, password, firstName, lastName, role
  } = req.body;

  const user = new User({
    email, firstName, lastName, createdOn: Date.now(), role
  });
  user.password = user.encryptPassword(password);

  await user.save();
  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id,
      role: user.role
    },
    process.env.SECRET,
    {
      expiresIn: '1h'
    }
  );
  res.status(201).json({ user: user.toJSON(), token });
};

export const register = relogRequestHandler(registerWrapper, { validation: { body: addUserSchema }, skipJwtAuth: true });
