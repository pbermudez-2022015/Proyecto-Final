'use strict'

import { checkUpdate } from '../utils/validator.js'
import Categoria from './categoria.model.js'
import Product from '../product/product.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test function is running' })
}

//guardar categorias
export const save = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can save categories.' });
        }
        let data = req.body;
        let categoria = new Categoria(data);
        await categoria.save();
        return res.send({ message: 'Category saved successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error saving Category' });
    }
};

//mostrar las categorias
export const get = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can get categories.' });
        }
        let categoria = await Categoria.find();
        return res.send({ categoria });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting Category' });
    }
};

//categoria por separado
export const getCategoria = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can get categories.' });
        }
        let { id } = req.params;
        let categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).send({ message: 'Category not found' });
        }
        return res.send({ categoria });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting Category' });
    }
};

//actualizar la categoria
export const update = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can update categories.' });
        }
        let data = req.body;
        let { id } = req.params;
        let update = checkUpdate(data, false);
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' });
        let updatedCategoria = await Categoria.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );
        if (!updatedCategoria) return res.status(404).send({ message: 'Category not found and not updated' });
        return res.send({ message: 'Category updated successfully', updatedCategoria });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating Category' });
    }
};


//default categoria
export const defaultCategoria = async () => {
    try {
        const defaultCategoria = await Categoria.findOne({ name: 'Default' });
        if (!defaultCategoria) {
            const newDefaultCategoria = new Categoria({
                name: 'Default',
                description: 'Categoría predeterminada'
            });
            await newDefaultCategoria.save();
            console.log('Default Categoria created successfully');
        } else {
            console.log('Default Categoria already exists');
        }
    } catch (error) {
        console.error('Error initializing Default Categoria:', error);
        // Si lo deseas, podrías lanzar el error o realizar otra acción aquí
    }
};




//Eliminar Categoria
export const deleteC = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized. Only admins can delete categories.' });
        }
        let { id } = req.params;
        let deletedCategoria = await Categoria.findById(id);
        if (!deletedCategoria) {
            return res.status(404).send({ message: 'Category not found and not deleted' });
        }
        let defaultCategoria = await Categoria.findOne({ name: 'Default' });
        if (!defaultCategoria) {
            return res.status(404).send({ message: 'Default category not found' });
        }
        await Product.updateMany({ categoria: id }, { categoria: defaultCategoria._id });
        await Categoria.deleteOne({ _id: id });
        return res.send({ message: 'Deleted Category successfully' });
    } catch (err) {
        console.error(err);
        return res.status(404).send({ message: 'Error deleting Category' });
    }
};
//buscar categorias por nombre
export const search = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized. Only admins can search categories.' });
        }
        let { search } = req.body;
        let categoria = await Categoria.find(
            { name: search }
        );
        if (!categoria) return res.status(404).send({ message: 'Category not found' });
        return res.send({ message: 'Category found', categoria });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching Category' });
    }
};
