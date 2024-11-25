    import datauri from 'datauri/parser.js'
    import path from 'path'

    const parser = new datauri();
    const getDatauri = (file)=>{
        const extName = path.extName(file.originalname).toString();
        return parser.format(extName,file.buffer).content
    }

    export default getDatauri;
