'use strict'

import { Router } from 'express'
import { validateJwt } from '../middlewares/validate-jwt.js'
import { getUserInvoices, updateInvoice, save, makePurchase, generatePDFInvoice } from './shopping.controller.js'

const api = Router()



//rutas privadas
api.post('/save', [validateJwt], save)
api.post('/purchase', [validateJwt], makePurchase)
api.post('/:invoiceId/pdf', generatePDFInvoice)
api.put('/update/:invoiceId', [validateJwt], updateInvoice)
api.get('/getUser/:_id', [validateJwt], getUserInvoices)

export default api