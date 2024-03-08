'use strick'

import Shopping from './shopping.model.js';
import Product from '../product/product.model.js';
import Invoice from '../invoice/invoice.model.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';

// se agraga para poder comprar luego en el carrito
export const save = async (req, res) => {
    try {
        let data = req.body;
        if (!data.stock || data.stock <= 0) {
            return res.status(400).send({ message: 'Stock must be provided and greater than 0' });
        }
        const product = await Product.findById(data.product);
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        if (product.stock < data.stock) {
            return res.status(400).send({ message: 'Not enough stock available' });
        }
        product.stock -= data.stock;
        await product.save();
        let shopping = new Shopping({
            product: data.product,
            user: req.user._id,
            stock: data.stock
        });
        await shopping.save();
        return res.send({ message: 'Product added to the shopping cart successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error adding product to the shopping cart' });
    }
}

// se realiza la compra y se agrega la factura y se elimina el carrito
export const makePurchase = async (req, res) => {
    try {
        const userId = req.user._id;
        const shopping = await Shopping.findOne({ user: userId }).populate('product');
        if (!shopping) {
            return res.status(404).send({ message: 'Shopping cart not found' });
        }
        const newInvoice = new Invoice({
            user: userId,
            shopping: shopping._id,
            total: shopping.product.price * shopping.stock,
            items: [{
                product: shopping.product,
                quantity: shopping.stock,
                subtotal: shopping.product.price * shopping.stock
            }]
        });
        console.log(shopping)
        await newInvoice.save();
        await Shopping.findByIdAndDelete(shopping._id);
        return res.status(201).send({ message: 'Purchase completed successfully', invoice: newInvoice });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error making purchase' });
    }
};


// genera el pdf 
export const generatePDFInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        // Busca la factura en la base de datos utilizando el ID proporcionado
        const invoice = await Invoice.findById(invoiceId).populate('user').populate('shopping');
        if (!invoice) {
            return res.status(404).send({ message: 'Invoice not found' });
        }
        // Crea un nuevo documento PDF
        const doc = new PDFDocument();
        const filePath = `invoice_${invoiceId}.pdf`;
        doc.pipe(fs.createWriteStream(filePath));
        // Escribe el contenido en el PDF
        doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();
        doc.fontSize(16).text(`Invoice ID: ${invoice._id}`).moveDown();
        doc.fontSize(14).text(`Date: ${invoice.date}`).moveDown();
        doc.fontSize(14).text(`User: ${invoice.user.name} (${invoice.user.email})`).moveDown();
        doc.moveDown();
        doc.fontSize(16).text('Items:').moveDown();
        invoice.items.forEach((item, index) => {
            doc.fontSize(12).text(`Item ${index + 1}:`);
            doc.fontSize(10).text(`Product: ${item.product.name}`);
            doc.fontSize(10).text(`Quantity: ${item.quantity}`);
            doc.fontSize(10).text(`Subtotal: ${item.subtotal}`).moveDown();
        });
        doc.fontSize(16).text(`Total: ${invoice.total}`).moveDown();
        doc.end();
        // Establece las cabeceras para devolver el PDF como una descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filePath}"`);
        // Envia el PDF al cliente
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        // Elimina el archivo PDF después de enviarlo
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error generating PDF invoice' });
    }
};

// puede actualizar cualquier factura si se es ADMIN
export const updateInvoice = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const { invoiceId } = req.params;
        const updatedInvoice = req.body;
        const updated = await Invoice.findByIdAndUpdate(invoiceId, updatedInvoice, { new: true });

        if (!updated) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        for (const item of updated.items) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product._id} not found` });
            }
            product.stock = item.quantity;
            await product.save();
        }
        return res.status(200).json({ message: 'Invoice updated successfully', updatedInvoice: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating invoice' });
    }
};

//las cuentas asociadas a las compras
export const getUserInvoices = async (req, res) => {
    try {
        const userId = req.user._id;
        const invoices = await Invoice.find({ user: userId });
        return res.status(200).json({ invoices });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving user invoices' });
    }
};



