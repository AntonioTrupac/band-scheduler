import { model, Model, models, Schema } from 'mongoose';

export type StudioType = {
  name: string;
  location: string;
  createdBy: string;
  bands: string[];
} & Document;

const StudioSchema: Schema = new Schema({
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
  createdBy: { type: String, required: true },
  organizationId: { type: String, required: true },
  bands: [{ type: Schema.Types.ObjectId, ref: 'Band' }],
});

const StudioModel: Model<StudioType> =
  (models.Studio as Model<StudioType>) ||
  model<StudioType>('Studio', StudioSchema);

export default StudioModel;
