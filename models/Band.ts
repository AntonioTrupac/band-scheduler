import { Model, models, model, Document, Schema } from 'mongoose';

export type BandType = {
  name: string;
  location: string;
  rehearsals: {
    _id?: string;
    start: Date;
    end: Date;
    title: string;
    bandId?: string;
    createdBy: string;
  }[];
  studioId: string;
  createdBy: string;
} & Document;

const BandSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    dropDups: true,
  },
  location: {
    type: String,
    required: true,
  },
  rehearsals: [
    {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      bandId: {
        type: Schema.Types.ObjectId,
        ref: 'Band',
      },
      createdBy: {
        type: String,
        required: true,
      },
    },
  ],
  studioId: {
    type: Schema.Types.ObjectId,
    ref: 'Studio',
  },
  createdBy: {
    type: String,
    required: true,
  },
});

// Add index for efficient querying
// 1 ascending order, -1 descending order
BandSchema.index({ studioId: 1, createdBy: 1, name: 1 });
BandSchema.index({ 'rehearsals.start': 1, 'rehearsals.end': 1 });

// TODO: Remove as Model<BandType> from BandModel and fix types where needed in the app
const BandModel: Model<BandType> =
  (models.Band as Model<BandType>) || model<BandType>('Band', BandSchema);

export default BandModel;
