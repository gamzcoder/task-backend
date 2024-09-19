import mongoose, {
  Document, Model, Schema, model
} from 'mongoose';

const objectId = Schema.Types.ObjectId;
export interface IQuiz extends Document {
  _id:string,
  name: string;
  description: string;
  createdBy: string;
  questions: {
    question: string;
    options: {
      a: string;
      b: string;
      c: string;
      d: string;
    };
    answer: string;
  }[];
}

interface IQuizModel extends Model<IQuiz> {}

const quizSchema = new Schema<IQuiz>({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: {
        a: {
          type: String,
          required: true
        },
        b: {
          type: String,
          required: true
        },
        c: {
          type: String,
          required: true
        },
        d: {
          type: String,
          required: true
        }
      },
      answer: {
        type: String,
        required: true
      }
    }
  ]
});

quizSchema.methods.getNumberOfQuestions = function () {
  return this.questions.length;
};

export const Quiz: IQuizModel = model<IQuiz, IQuizModel>('Quiz', quizSchema);
