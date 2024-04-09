import express from 'express'
import { router } from './router.js'

//const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use("/api/drive", router)
export function start(){
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

