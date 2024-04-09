import express from 'express'

export const router =express.Router()

router.get('/photo', (req, res) => {
    res.send('test')
})