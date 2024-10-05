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
        required: true,
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
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
});

// Compound unique index for name and studioId
BandSchema.index({ name: 1, studioId: 1 }, { unique: true });

// Add index for efficient querying
BandSchema.index({ studioId: 1, createdBy: 1, name: 1 });
BandSchema.index({ 'rehearsals.start': 1, 'rehearsals.end': 1 });

BandSchema.pre<BandType>('save', function (next) {
  console.log('Band name before hook:', this.name);

  if (typeof this.name === 'string') {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  console.log('Band name after hook:', this.name);

  next();
});

// TODO: Remove as Model<BandType> from BandModel and fix types where needed in the app
const BandModel: Model<BandType> =
  (models.Band as Model<BandType>) || model<BandType>('Band', BandSchema);

export default BandModel;
