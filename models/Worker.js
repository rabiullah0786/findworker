import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema({
    name: String,
    age: String,
    skill: String,
    state: String,
    district: String,
    city: String,
    whatsapp: String,
    photo: String,
});

export default mongoose.models.Worker ||
    mongoose.model("Worker", WorkerSchema);