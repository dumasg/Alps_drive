import express from 'express'
import path from "path";
import os from "os";
import fs from "fs";



export const router = express.Router()

const racinePath = path.join(os.tmpdir(), 'newFolder')

router.get("/", async (req, res) => {

    readDirectory(racinePath)
        .then(files => creationJSONResponse(files)
            .then(arrayResponse => {
                if (arrayResponse) {
                    res.status(200).send(arrayResponse)
                }else{
                    res.status(500).send("Erreur avec le serveur")
                }
            }))
})

router.get("/*", async (req, res) => {
    const pathUser = path.join(racinePath, req.params[0])
    try {
        fs.access(pathUser, fs.constants.R_OK, async (err) => {
            if (!err) {
                const file = await fs.promises.stat(pathUser)
                if (file.isDirectory()){
                    readDirectory(pathUser)
                        .then(files => creationJSONResponse(files)
                            .then(arrayResponse => {
                                if (arrayResponse) {
                                    res.status(200).send(arrayResponse)
                                } else {
                                    res.status(500).send("Erreur avec le serveur")
                                }
                            }))
                }else{
                    const fileRead = fs.readFileSync(pathUser, 'utf-8')
                    res.status(200).send(fileRead)
                }

            }
        })
    }catch (e) {
        res.status(500).send("Problème de lecture")
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

router.delete("/*", async (req, res) => {
    const name = req.params[0]
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

        await fs.promises.rename(fileRequest, filename)
        await deleteItem("/tmp/newFolder/tmp")
        return res.sendStatus(201)
    }

})




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


async function readDirectory(pathDirectory){
    return new Promise((resolve, reject) => {
        return fs.readdir(pathDirectory, {withFileTypes: true}, (err, files) => {
            if (err){
                reject(err)
            }
            else{
                resolve(files)
            }
        })
    })
}

async function creationJSONResponse(arrayFiles){
    const arrayResponse = []
    for (const file of arrayFiles) {
        let objTemp = {}
        const itemPath = path.join(file.path, file.name)
        const statsItem = await fs.promises.stat(itemPath)
        if (statsItem.isDirectory()){
            objTemp = {name: file.name, isFolder: statsItem.isDirectory()}
        }else{
            objTemp = {name: file.name, isFolder: statsItem.isDirectory(), size: statsItem.size}
        }
        arrayResponse.push(objTemp)
    }
    return arrayResponse
}



///////////////////
// SAVE FONCTION //
///////////////////

// async function creationResponseInit(pathFile, arrayResponse, file){
//     const itemPath = path.join(pathFile, file)
//     let objectTmp = {}
//     const stats = await fs.promises.stat(itemPath)
//     if (stats.isFile()){
//         objectTmp = {...objectTmp, "name": file, isFolder: false, size: stats.size}
//     }else{
//         objectTmp = {...objectTmp, "name": file, isFolder: true}
//     }
//     arrayResponse.push(objectTmp)
// }


// async function isAFile(path){
//     return await fs.promise.stat(path).isFile()
// }



// function listingDataOnRepository(path){
//     return new Promise((resolve, reject) => {
//         return fs.readdir(path, (err, files) => {
//             err != null ? reject(err) : resolve(files)
//         })
//     })
// }

////////////////
// SAVE ROUTE //
///////////////

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


// router.get("/*", async (req, res) => {
//     const pathFileAndRepository = path.join(racinePath, req.params[0])
//     if (fs.existsSync(pathFileAndRepository)){
//         if(await isAFile(pathFileAndRepository)){
//                 const file = fs.promises.readFile(pathFileAndRepository, 'utf-8')
//                 return res.status(200).send(file)
//         }else{
//             const data = listingDataOnRepository(pathFileAndRepository)
//             data
//                 .then(arrayFiles => {
//                     const arrayResponse = []
//                     arrayFiles.forEach(file => {
//                         creationResponseInit(pathFileAndRepository, arrayResponse, file)
//                     })
//                     return res.status(200).send(arrayResponse)
//                 })
//         }
//     }else{
//         return res.status(404).send("Le fichier n'a pas été trouvée")
//     }
// })

//router.get("/", async (req, res) => {
    //const pathUser = path.join(racinePath)
    //const dataOnFolder = fcDataOnFolder(racinePath)
    // try {
    //     dataOnFolder.then(async files => {
    //         const arrayResponse = []
    //         for (const item of files) {
    //             let objTemp = {}
    //             const itemPath = path.join(racinePath, item)
    //             const itemStats = await fs.promises.stat(itemPath)
    //             //console.log(itemStats)
    //             if (itemStats.isFile()) {
    //                 objTemp = {"name": item, "isFolder": itemStats.isDirectory(), "size": itemStats.size}
    //             } else {
    //                 objTemp = {"name": item, "isFolder": itemStats.isDirectory()}
    //             }
    //             //console.log(objTemp)
    //             arrayResponse.push(objTemp)
    //         }
    //         //console.log("array : ", await arrayResponse)
    //         return res.send(arrayResponse)
    //     })
    // }catch (e){
    //     return res.status(500).send("Soucis avec le serveur")
    // }
//})

// router.get('/', async (req, res) => {
//     try {
//         const data = listingDataOnRepository(racinePath)
//         data
//             .then(arrayFiles => {
//                 const arrayResponse = []
//                 arrayFiles.forEach(file => {
//                     creationResponseInit(racinePath, arrayResponse, file)
//                 })
//                 return res.send(arrayResponse)
//             })
//     }catch (e) {
//         return res.status(500).send("Soucis avev le serveur")
//     }
//
//
// })