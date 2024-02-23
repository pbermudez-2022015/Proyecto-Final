import { Schema, model } from 'mongoose';

const categoriaSchema = Schema({
    name: {
        type: String,
        required: true
    },
    keeper: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true
    }
}, {
    versionKey: false
})

export default model('categoria', categoriaSchema)