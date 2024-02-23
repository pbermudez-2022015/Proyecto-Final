'use strict'

import Product from '../product/product.model.js'
import { checkUpdate } from '../utils/validator.js'
import Categoria from './categoria.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test function is running' })
}

export const save = async (req, res) => {
    try {
        let data = req.body
        let product = await Product.findOne({ _id: data.keeper })
        if (!product) return res.status(404).send({ message: 'Keeper not found' })
        let categoria = new Categoria(data)
        await categoria.save()
        return res.send({ message: 'Categoria saved successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error saving Categoria' })
    }
}

export const get = async (req, res) => {
    try {
        let categoria = await Categoria.find()
        return res.send({ categoria })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting Categoria' })
    }
}


export const getCategoria = async (req, res) => {
    try {
        let { id } = req.params;
        let categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).send({ message: 'Categoria not found' });
        }
        return res.send({ categoria });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting Categoria' });
    }
};

export const update = async (req, res) => {
    try {
        let data = req.body
        //Capturar el id del Categoria a actualizar
        let { id } = req.params
        //Validar que vengan datos
        let update = checkUpdate(data, false)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        //Actualizar
        let updatedCategoria = await Categoria.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('keeper', ['keeper']) //Eliminar la información sensible
        if (!updatedCategoria) return res.status(404).send({ message: 'Categoria not found and not updated' })
        return res.send({ message: 'Categoria updated successfully', updatedCategoria })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating Categoria' })
    }
}

export const deleteC = async (req, res) => {
    try {
        let { id } = req.params
        let deletedCategoria = await Categoria.deleteOne({ _id: id })
        if (deletedCategoria.deletedCount === 0) return res.status(404).send({ message: 'Categoria not found and not deleted' })
        return res.send({ message: 'Deleted Categoria successfully' })
    } catch (err) {
        console.error(err)
        return res.status(404).send({ message: 'Error deleting Categoria' })
    }
}

export const search = async (req, res) => {
    try {
        let { search } = req.body
        let categoria = await Categoria.find(
            { name: search }
        ).populate('keeper', ['keeper'])
        if (!categoria) return res.status(404).send({ message: 'Categoria not found' })
        return res.send({ message: 'Categoria found', categoria })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error searching Categoria' })
    }
}
