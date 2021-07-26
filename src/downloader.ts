import FileSaver = require('file-saver');
import JSZip = require('jszip');
import { ServerScopedConverted } from '../@Types/snDocsSite/serverScopedConverted'

export class Downloader {
    constructor(){}

    async zipSNDocData(docData: {releaseName:string, data:ServerScopedConverted.ServerNamespaceItem[]}[]){

        let zip = new JSZip();
        docData.forEach((docItem) => {
            docItem.data.forEach((nameSpace) => {
                let fileName = `${docItem.releaseName}_${nameSpace.namespace || "no-namespace"}.json`;
                zip.file(fileName, JSON.stringify(nameSpace, null, '\t'));
            })
        })

        let zipResult = await zip.generateAsync({type: "blob"});
        if(zipResult){
            FileSaver.saveAs(zipResult, `SNDocData`);
        }
        
    }

    zipTSDocData(data:{fileName:string, content:string}[]){

    }

    async zipAnalystsData(analysis: {releaseName:string, data:any}[]){
        let zip = new JSZip();

        analysis.forEach((item) =>{
            let fileName = `${item.releaseName}_Analysis.json`;
            zip.file(fileName, JSON.stringify(item.data, null, '\t'));
        });
        

        let zipResult = await zip.generateAsync({type: "blob"});
        if(zipResult){
            FileSaver.saveAs(zipResult, `SNDocDataAnalysis`);
        }
    }
}