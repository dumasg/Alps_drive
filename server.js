import express from 'express'
import { router } from './router.js'
import { cors } from './middleware/cors.js'
import bb from "express-busboy";


//const express = require('express')
const app = express()
const port = 3000

bb.extend(app, {
    upload: true,
    path: '/tmp/newFolder/tmp',
    allowedPath: /./
});


app.use(cors)

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use("/api/drive", router)


export function start(){
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

