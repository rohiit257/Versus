import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';


export const renderEmailEJS = async (filename:string , payload:any) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const html:string = await ejs.renderFile(__dirname + `/views/email/${filename}.ejs`,payload)

    return html;
}