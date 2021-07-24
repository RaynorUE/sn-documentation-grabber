import FileSaver = require('file-saver');
import JSZip = require('jszip');
import { ServerScopedConverted } from '../@Types/snDocsSite/serverScopedConverted'

export class Downloader {
    constructor(){}

    async zipSNDocData(data:ServerScopedConverted.ServerNamespaceItem[]){

        let zip = new JSZip();
        data.forEach((nameSpace) => {
            let fileName = `${nameSpace.namespace || "no-namespace"}.json`;
            zip.file(fileName, JSON.stringify(nameSpace, null, '\t'));
        })

        let zipResult = await zip.generateAsync({type: "blob"});
        if(zipResult){
            FileSaver.saveAs(zipResult, 'SNDocData.zip');
        }
        
    }

    zipTSDocData(data:{fileName:string, content:string}[]){

    }

}