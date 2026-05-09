import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    eventId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    status:{
        type: String,
        enum: ["booked", "cancelled", "pending"],
        default: "pending",
    },
    paymentStatus:{
        type: String,
        enum: ["paid", "unpaid"],   
        default: "unpaid",
    },
    amount:{
        type: Number,
        required: true,
    }
}, {timestamps: true});

export default mongoose.model("Booking", bookingSchema);