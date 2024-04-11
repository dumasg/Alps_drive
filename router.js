import express from 'express'
import path from "path";
import os from "os";
import fs from "fs";
import bb from "busboy";





export const router = express.Router()

const racinePath = path.join(os.tmpdir(), 'newFolder')
router.get('/', async (req, res, next) => {
    try {
        const data = listingDataOnRepository(racinePath)
        data
            .then(arrayFiles => {
                const arrayResponse = []
                arrayFiles.forEach(file => {
                    creationResponseInit(racinePath, arrayResponse, file)
                })
                return res.send(arrayResponse)
            })
    }catch (e) {
        return res.status(500).send("Soucis avev le serveur")
    }


})

router.get("/*", (req, res) => {

    const pathFileAndRepository = path.join(racinePath, req.params[0])
    if (fs.existsSync(pathFileAndRepository)){
        if(isAFile(pathFileAndRepository)){
                const file = fs.readFileSync(pathFileAndRepository, 'utf-8')
                return res.status(200).send(file)
        }else{
            const data = listingDataOnRepository(pathFileAndRepository)
            data
                .then(arrayFiles => {
                    const arrayResponse = []
                    arrayFiles.forEach(file => {
                        creationResponseInit(pathFileAndRepository, arrayResponse, file)
                    })
                    return res.status(200).send(arrayResponse)
                })
        }
    }else{
        return res.status(404).send("Le fichier n'a pas été trouvée")
    }
})

router.post("/*", async (req, res) => {
    const nameFolder = req.query.name
    const repositoryName = req.params[0] + nameFolder
    const pathNewFolder = path.join(racinePath, repositoryName)

    if(checkCaractAlpha(req.query.name)){
        createNewFolder(pathNewFolder, res)
    }else{
        return res.status(400).send("Caractère non autorisé")
    }
})

// router.post("/:nameFolder/", async (req, res) => {
//         const pathNewFolder = path.join(racinePath,req.params.nameFolder, req.query.name)
//
//      if(checkCaractAlpha(req.query.name)){
//          createNewFolder(pathNewFolder, res)
//      }else{
//          return res.status(400).send("Caractère non autorisé")
//      }
//
// })

router.delete("/*", async (req, res) => {
    const name = req.params[0]
    console.log(name)
    const pathDeleteFolder = path.join(racinePath, name)

    if (await deleteItem(pathDeleteFolder)){
        return res.sendStatus(200)
    }else{
        return res.status(400).send("La suppression n'a pas été effectuée")
    }
})

router.put("/*", async(req, res) => {
    const pathTmp = req.params[0] === '' ? '/' : req.params[0]
    const pathForUpload = path.join(racinePath, pathTmp)

    if(!req.files){
        return res.status(400).send("Aucun fichier")
    }else{
        const filename = pathForUpload + req.files.file.filename
        const fileRequest = req.files.file.file

        fs.renameSync(fileRequest, filename)
        await deleteItem("/tmp/newFolder/tmp")
        return res.sendStatus(201)
    }

})


function creationResponseInit(pathFile, arrayResponse, file){
    const itemPath = path.join(pathFile, file)
    let objectTmp = {}
    const stats = fs.statSync(itemPath)
    if (stats.isFile()){
        objectTmp = {...objectTmp, "name": file, isFolder: false, size: stats.size}
    }else{
        objectTmp = {...objectTmp, "name": file, isFolder: true}
    }
    arrayResponse.push(objectTmp)
}


function isAFile(path){
    return fs.statSync(path).isFile()
}



function listingDataOnRepository(path){
    return new Promise((resolve, reject) => {
        return fs.readdir(path, (err, files) => {
            err != null ? reject(err) : resolve(files)
        })
    })
}

function checkCaractAlpha(str){
    if(str.match(new RegExp(/^[a-zA-Z]+$/gm))){
        return true
    }else{
        return false
    }
}

async function createNewFolder(pathNewFolder, res){
    try{
        await fs.promises.mkdir(pathNewFolder, {recursive: true})
        return res.sendStatus(201)
    }catch (error) {
        return res.status(404).send("Erreur lors de la création", error)
    }
}

async function deleteItem(pathDeleteFolder){
    try{
        await fs.promises.rm(pathDeleteFolder, {recursive: true})
        return true
    }catch (error){
        return false
    }
}