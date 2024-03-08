import { Schema, model } from 'mongoose';

const categoriaSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }

}, {
    versionKey: false
})

export default model('categoria', categoriaSchema)