import { Schema, model } from 'mongoose';

const shoppingSchema = Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    versionKey: false
});

export default model('shopping', shoppingSchema); 
