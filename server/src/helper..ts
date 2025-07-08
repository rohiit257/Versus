import ejs from 'ejs';
import moment from 'moment';
import path from 'path';
import { fileURLToPath } from 'url';


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