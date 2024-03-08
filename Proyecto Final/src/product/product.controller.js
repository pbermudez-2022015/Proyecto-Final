'use strict'

import Categoria from '../categoria/categoria.model.js'
import { checkUpdate } from '../utils/validator.js'
import Product from './product.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test function is running' })
}

//Esta funcion debe guardar el producto solo por el ADMIN
export const save = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can save products.' });
        }
        let data = req.body;
        let categoria = await Categoria.findOne({ _id: data.categoria });
        if (!categoria) return res.status(404).send({ message: 'Categoria not found' });
        const existingProduct = await Product.findOne({ name: data.name });
        if (existingProduct) {
            return res.status(400).send({ message: 'Product with this name already exists' });
        }
        let product = new Product(data);
        await product.save();
        return res.send({ message: 'Product saved successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error saving product' });
    }
}


//mostrar en todos
export const get = async (req, res) => {
    try {
        let product = await Product.find().populate({ path: 'categoria', select: 'name -_id name description' });
        return res.send({ product });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting Products' });
    }
};



//mostrar buscando por _id
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

//esta funcion puede actualizar solo si es Admin, editar detalladamente el producto
export const update = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can update products.' });
        }
        let data = req.body;
        let { id } = req.params;
        let update = checkUpdate(data, false);
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' });
        let updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );
        if (!updatedProduct) return res.status(404).send({ message: 'Product not found and not updated' });
        return res.send({ message: 'Product updated successfully', updatedProduct });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating Product' });
    }
};


//delete producto
export const deleteP = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can deleted products.' });
        }
        let { id } = req.params
        let deletedProduct = await Product.deleteOne({ _id: id })
        if (deletedProduct.deletedCount === 0) return res.status(404).send({ message: 'Product not found and not deleted' })
        return res.send({ message: 'Deleted Product successfully' })
    } catch (err) {
        console.error(err)
        return res.status(404).send({ message: 'Error deleting Product' })
    }
}

//este serch puede buscar todos los parametros que establece el proyecto
export const search = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can search products.' });
        }
        const { name, outOfStock, topSelling } = req.body;
        let query = {};
        if (name) {
            query.name = name;
        }
        // Si se proporciona el parametro "outOfStock", filtrar productos agotados.
        if (outOfStock) {
            query.stock = 0;
        }
        let product = await Product.find(query).populate('categoria', '-_id name name description');
        // Ordenar productos por stock en orden descendente si se proporciona el parámetro "topSelling"
        if (topSelling) {
            product = product.sort((a, b) => b.stock - a.stock);
        }
        if (!product || product.length === 0) {
            return res.status(404).send({ message: 'Products not found' });
        }
        return res.send({
            message: 'Products found',
            product
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching products' });
    }
};

//Search de los cliente
export const searchClient = async (req, res) => {
    try {
        const { name, outOfStock, topSelling, categoriName } = req.body;
        let query = {};
        // Agregar la búsqueda por nombre de categoría
        if (categoriName) {
            const categoria = await Categoria.findOne({ name: categoriName });
            if (!categoria) {
                return res.status(404).send({ message: 'categoria not found' });
            }
            query.categoria = categoria._id;
        }
        if (name) {
            query.name = name;
        }
        if (outOfStock) {
            query.stock = 0;
        }
        let products = await Product.find(query).populate('categoria', '-_id name description');
        if (topSelling) {
            products = products.sort((a, b) => b.stock - a.stock);
        }
        if (!products || products.length === 0) {
            return res.status(404).send({ message: 'Products not found' });
        }
        return res.send({
            message: 'Products found',
            products
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching products' });
    }
};



