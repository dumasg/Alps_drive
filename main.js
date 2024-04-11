import {start} from "./server.js";
import fs from "fs";
import path from "path";
import os from "os";

const folderPath = path.join(os.tmpdir(), 'newFolder')


if (creationFolderTmp(folderPath)){
    console.log("server on")
    start()
}else{
    console.log("Creation du folder fail")
}

//start()


async function creationFolderTmp(folderPath){
    try{
        await fs.promises.mkdir(folderPath, {recursive: true})
        return true
    }catch (e) {
        return false
    }
}
