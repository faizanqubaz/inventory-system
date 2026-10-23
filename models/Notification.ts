import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: string;
  requestId: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "purchase_request",
      index: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>(
    "Notification",
    NotificationSchema
  );

export default Notification;