'use strict'

import User from '../user/user.model.js'
import { checkUpdate } from '../utils/validator.js'
import Product from './product.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test function is running' })
}

export const save = async (req, res) => {
    try {
        let data = req.body
        let user = await User.findOne({ _id: data.keeper })
        if (!user) return res.status(404).send({ message: 'Keeper not found' })
        let product = new Product(data)
        await product.save()
        return res.send({ message: 'Product saved successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error saving product' })
    }
}

export const get = async (req, res) => {
    try {
        let product = await Product.find()
        return res.send({ product })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting Product' })
    }
}


export const getProduct = async (req, res) => {
    try {
        let { id } = req.params;
        let product = await Product.findById(id);
        if (!product) {
            return res.status(404).send({ message: 'User not found' });
        }
        return res.send({ product });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting User' });
    }
};

export const update = async (req, res) => {
    try {
        let data = req.body
        //Capturar el id del Product a actualizar
        let { id } = req.params
        //Validar que vengan datos
        let update = checkUpdate(data, false)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        //Actualizar
        let updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('keeper', ['name', 'phone']) //Eliminar la información sensible
        if (!updatedProduct) return res.status(404).send({ message: 'Product not found and not updated' })
        return res.send({ message: 'Product updated successfully', updatedProduct })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating Product' })
    }
}

export const deleteP = async (req, res) => {
    try {
        let { id } = req.params
        let deletedProduct = await Product.deleteOne({ _id: id })
        if (deletedProduct.deletedCount === 0) return res.status(404).send({ message: 'Product not found and not deleted' })
        return res.send({ message: 'Deleted Product successfully' })
    } catch (err) {
        console.error(err)
        return res.status(404).send({ message: 'Error deleting Product' })
    }
}

export const search = async (req, res) => {
    try {
        let { search } = req.body
        let product = await Product.find(
            { name: search }
        ).populate('keeper', ['name', 'phone'])
        if (!product) return res.status(404).send({ message: 'Product not found' })
        return res.send({ message: 'Product found', product })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error searching Product' })
    }
}
