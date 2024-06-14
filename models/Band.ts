import { Model, models, model, Document, Schema } from 'mongoose';

export type BandType = {
  name: string;
  location: string;
  rehearsals: {
    _id?: string;
    start: Date;
    end: Date;
    title: string;
  }[];
  studio: string;
} & Document;

const BandSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
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
    },
  ],
  studioId: {
    type: Schema.Types.ObjectId,
    ref: 'Studio',
  },
});

const BandModel: Model<BandType> =
  (models.Band as Model<BandType>) || model<BandType>('Band', BandSchema);

export default BandModel;
