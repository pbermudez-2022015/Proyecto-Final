'use strict'

import jwt from "jsonwebtoken"
import User from '../user/user.model.js'

export const validateJwt = async (req, res, next) => {
    try {
        //Obtener la llave de acesso al token
        let secretKey = process.env.SECRET_KEY
        //Obtener el token de los headers
        let { authorization } = req.headers
        //Verificar si viene el token
        if (!authorization) return res.status(401).send({ message: 'Unauthorized' })
        //Validar el vid del usuario que envio
        let { uid } = jwt.verify(authorization, secretKey)
        //Validar si aun existe en la DB
        let user = await User.findOne({ _id: uid })
        if (!user) return res.status(404).send({ message: 'User not found - Unauthorizate' })
        req.user = user
        next()
    } catch (err) {
        console.error(err)
        return res.status(401).send({ message: 'Invalid Token' })
    }
}

// Middleware para validar el token JWT y obtener al usuario logueado
export const validateJwtAndUpdateClient = async (req, res, next) => {
    try {
        // Llamar al middleware validateJwt para validar el token JWT y obtener al usuario logueado
        await validateJwt(req, res, async () => {
            // Llamar a la función para actualizar al usuario logueado (cliente)
            await updateClient(req, res);
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating client' });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        let { user } = req
        if (!user || user.role !== 'ADMIN') return res.status(403).send({ message: `You dont have access: ${user.username}` })
        next()
    } catch (err) {
        console.error(err)
        return res.status(403).send({ message: 'Unauthorized role' })
    }

}