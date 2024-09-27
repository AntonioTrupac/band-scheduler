import { Model, models, model, Document, Schema } from 'mongoose';

export type InvitationType = {
  token: string;
  invitationName: string;
  studioId: string;
  expiresAt: Date;
} & Document;

// TODO: Add InvitationType into new Schema

const InvitationSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true },
  invitationName: { type: String, required: true },
  studioId: { type: Schema.Types.ObjectId, ref: 'Studio', required: true },
  expiresAt: { type: Date, required: true },
});

// TODO: Remove as Model<Invitation> from InvitationModel and fix types where needed in the app
const InvitationModel: Model<InvitationType> =
  (models.Band as Model<InvitationType>) ||
  model<InvitationType>('Invitation', InvitationSchema);

export default InvitationModel;
