import ejs from 'ejs';
import moment from 'moment';
import path from 'path';
import { fileURLToPath } from 'url';
import { Supportmime } from './config/filetype.js';
import { UploadedFile } from 'express-fileupload';
import { v4 as uuid } from "uuid";
import { log } from 'console';



export const renderEmailEJS = async (filename:string , payload:any) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const html:string = await ejs.renderFile(__dirname + `/views/email/${filename}.ejs`,payload)

    return html;
}


export const timeDiff =  (date:Date ) =>{
    const now = moment()
    const tokensentat = moment(date)

    const difference = moment.duration(now.diff(tokensentat))

    return difference.asHours
}

export const bytetomb = (byte:number) => {
    return byte/(1024*1024)
}


export const imageValidator = (size:number,mime:string) =>{
    if(bytetomb(size) > 2){
        return `Image Size Should be less than 2 your current size is ${bytetomb(size)}`
    }
    else if (!Supportmime.includes(mime)){
        return "Image Must be type of png,jpg,jpeg"
    }

    return null
}

export const uploadImage = async (image:UploadedFile)=>{
    const imgext = image.name.split(".")
    const imageName = uuid() + "." + imgext[1]
    console.log(imageName);

    const uploadpath = process.cwd() + "/public/images" + imageName

    image.mv(uploadpath,(err)=>{
        if(err) throw err
    })

    return image.name

    
}