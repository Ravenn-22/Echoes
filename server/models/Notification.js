import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    scrapbook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scrapbook"
    },

    read: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
}
);

export default mongoose.model("Notification", notificationSchema);