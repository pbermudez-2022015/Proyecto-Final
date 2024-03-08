'use strict'

import User from './user.model.js'
import { encrypt, checkPassword } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'


export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//Empieza el crud completo con rol de: ADMIN.

//ADMIN por defecto, para realizar validacion de funciones
export const createAdmin = async (req, res) => {
    try {
        // Verificar si ya existe un usuario administrador
        const adminExists = await User.exists({ role: 'ADMIN' });
        // Si no existe, crea un nuevo administrador
        if (!adminExists) {
            // Encriptar la contraseña utilizando la funcion encrypt
            const newPassword = await encrypt('12345678'); //el valor segun la contrase;a que desees encriptar
            const adminData = {
                name: 'Admin',
                surname: 'Admin',
                username: 'admin',
                password: newPassword,
                email: 'admin@example.com',
                phone: '12345678',
                role: 'ADMIN'
            };
            await User.create(adminData);
            return res.send({ message: 'Default administrator created.' });
        } else {
            res.send({ message: 'An administrator already exists in the database.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error creating default administrator.' });
    }
};

/*Funcion agregar Admin o Cliente, en la hoja de instrucciones se menciona que debe ser utilizado en un solo registrar
con la capacidad de elejir el rol al se utilizara, que pueden usar los admins. Este register solo se puede utilizar si el el usuario tiene rol ADMIN*/
export const registerAd = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can register new users.' });
        }
        let data = req.body;
        data.password = await encrypt(data.password);
        let user = new User(data);
        await user.save();
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error registering user', err: err });
    }
};

//register publico coloca por defecto rol CLIENT
export const registerClient = async (req, res) => {
    try {
        let data = req.body
        data.password = await encrypt(data.password)
        data.rol = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

/*Puede logearse si coinciden los datos, tanto admin como del client*/
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        let user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            };
            let token = await generateJwt(loggedUser);
            return res.send({ message: `Welcome ${loggedUser.name}`, token, loggedUser });
        }
        return res.status(404).send({ message: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error to login' });
    }
}


// updated de cliente y solo puede actualizar si su rol es CLIENT
export const updateClient = async (req, res) => {
    try {
        let data = req.body;
        const currentUser = req.user;
        if (currentUser.role !== 'CLIENT') {
            return res.status(401).send({ message: 'Unauthorized, only clients can update their own data.' });
        }
        delete data.role;
        if ('password' in data) {
            data.password = await encrypt(data.password);
        }
        const updatedUser = await User.findByIdAndUpdate(currentUser._id, data, { new: true });
        if (!updatedUser) {
            return res.status(401).send({ message: 'User not found and not updated' });
        }
        return res.send({ message: 'Updated client', updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating client' });
    }
};

//Updated de Admin 
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        let data = req.body;
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can update user data.' });
        }
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).send({ message: 'User not found' });
        }
        if (req.user.role === 'ADMIN' && userToUpdate.role === 'CLIENT' && 'password' in data) {
            return res.status(401).send({ message: 'Unauthorized, Admin cannot update password for users with role CLIENT.' });
        }
        if ('password' in data) {
            data.password = await encrypt(data.password);
        }
        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
        if (!updatedUser) {
            return res.status(401).send({ message: 'User not found and not updated' });
        }
        return res.send({ message: 'Updated user', updatedUser });
    } catch (err) {
        console.error(err);
        if (err.keyValue && err.keyValue.username) {
            return res.status(400).send({ message: `Username ${err.keyValue.username} is already taken` });
        }
        return res.status(500).send({ message: 'Error updating account' });
    }
};


/*visualizacion de todos en general, de admin y cliente.*/
//funcion para buscar por nombre o rol
export const search = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can search users.' });
        }
        let { search } = req.body;
        let users = await User.find({
            $or: [
                { name: search },
                { role: search.toUpperCase() } // Convertir a mayusculas para asegurar la busqueda se usa el toUpperCase()
            ]
        });
        if (!users || users.length === 0) {
            return res.status(404).send({ message: 'Users not found' });
        }
        return res.send({ message: 'Users found', users });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching users' });
    }
};

//Sech para el cliente
export const searchCli = async (req, res) => {
    try {
        let { search } = req.body;
        let users = await User.find({
            $or: [
                { name: search },
                { role: search.toUpperCase() } // Convertir a mayusculas para asegurar la busqueda se usa el toUpperCase()
            ]
        });
        if (!users || users.length === 0) {
            return res.status(404).send({ message: 'Users not found' });
        }
        return res.send({ message: 'Users found', users });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching users' });
    }
};

// obtener dato por id del usuario
export const getUser = async (req, res) => {
    try {
        let { id } = req.params;
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        return res.send({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting User' });
    }
};


//Eliminar usuario pero solo lo permite si CLIENT
export const deleteU = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.role !== 'CLIENT') {
            return res.status(401).send({ message: 'Unauthorized, Only clients can delete their own account.' });
        }
        const { confirmation } = req.body;
        if (confirmation !== 'SI') {
            return res.status(400).send({ message: 'Confirmation required, Please confirm deletion by providing "SI".' });
        }
        let deletedUser = await User.findOneAndDelete({ _id: userId });
        if (!deletedUser) {
            return res.status(404).send({ message: 'Account not found and not deleted' });
        }
        return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` }); //status 200
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting account' });
    }
};

//puede eliminar usuarios pero no puede eliminar otros admins.
export const deleteAdmin = async (req, res) => {
    try {
        let { id } = req.params;
        if (req.user.role !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Only admins can delete user accounts.' });
        }
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).send({ message: 'User not found' });
        }
        if (userToDelete.role === 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized, Admins cannot be deleted.' });
        }
        let deletedUser = await User.findOneAndDelete({ _id: id });
        if (!deletedUser) {
            return res.status(404).send({ message: 'Account not found and not deleted' });
        }
        return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting account' });
    }
};


