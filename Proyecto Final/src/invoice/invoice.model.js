import { Schema, model } from 'mongoose';


const invoiceSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    shopping: {
        type: Schema.Types.ObjectId,
        ref: 'shopping',
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    items: [{
        product: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

export default model('invoice', invoiceSchema);

