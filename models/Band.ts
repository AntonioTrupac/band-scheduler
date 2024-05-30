import mongoose, {
  Model,
  models,
  model,
  Document,
  Schema,
  InferSchemaType,
} from 'mongoose';

export type BandType = {
  name: string;
  rehearsals: {
    start: Date;
    end: Date;
    title: string;
  }[];
} & Document;

const BandSchema: Schema = new Schema({
  name: {
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
});

const BandModel: Model<BandType> =
  (models.Band as Model<BandType>) || model<BandType>('Band', BandSchema);

export default BandModel;
