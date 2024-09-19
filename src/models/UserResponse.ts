import mongoose, {
  Document, Model, Schema, model
} from 'mongoose';

export interface IUserResponse extends Document {
  userId: string;
  quizId: string;
  isAttempted: boolean;
  isSubmitted: boolean;
  responses: {
    question: string;
    selected_option: string;
  }[];
  score: number;
  createdOn: Date;
  updatedOn: Date;
  submittedOn: Date;
}

interface IUserResponseModel extends Model<IUserResponse> {}

const userResponseSchema = new Schema<IUserResponse>({
  userId: {
    type: String,
    required: true
  },
  quizId: {
    type: String,
    required: true,
    ref: 'Quiz'
  },
  isAttempted: {
    type: Boolean,
    required: true
  },
  isSubmitted: {
    type: Boolean,
    required: true
  },
  responses: [
    {
      question: {
        type: String,
        required: true
      },
      selected_option: {
        type: String,
        required: true
      }
    }
  ],
  score: {
    type: Number,
    default: 0
  },
  createdOn: {
    required: true,
    type: Date
  },
  updatedOn: {
    required: true,
    type: Date,
    default: Date.now
  },
  submittedOn: {
    required: true,
    type: Date
  }
});

export const UserResponse: IUserResponseModel = model<
  IUserResponse,
  IUserResponseModel
>('UserResponse', userResponseSchema);
