import { ApplicationError } from './application-error';

export class ForbiddenRequest extends ApplicationError {
  constructor(message?: string) {
    super(message || 'Bad request', 403);
  }
}
