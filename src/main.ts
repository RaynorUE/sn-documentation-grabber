import { SNServerDocData } from "./SNServerDocData";
import { ServerScopedConverted } from '../@Types/snDocsSite/serverScopedConverted';
import { Downloader } from './downloader';
import { SNDocToTS} from './SNDocToTS';

declare var window: any

(async function () {
    let snDocUtil = new SNServerDocData();
    let activeVersions = await snDocUtil.getActiveVersions();
    console.log('Active versions: ', activeVersions);

    const docData:any[] = [];
    const analysisData:any[] = [];

    let dataRetrieval = activeVersions.map(async (releaseName) => {
        let snDocUtil2 = new SNServerDocData();
        let result:ServerScopedConverted.ServerNamespaceItem[] | undefined;
        if(window[`${releaseName}_snichTestData`]){
            result = window[`${releaseName}_snichTestData`];
        } else {
            result = await snDocUtil2.getScopedServerDocData(releaseName);
            window[`${releaseName}_snichTestData`] = result;
        }
        
        if (result) {
            var tsDocResult = new SNDocToTS().convertServerToTS(result);
            docData.push({releaseName: releaseName, data:tsDocResult});
            analysisData.push({releaseName: releaseName, data:{
                uniqueItemList: snDocUtil2.getUniqueItemList(),
                dataNotMapped: snDocUtil2.getDataNotMapped(),
            }})
        }
    });

    await Promise.all(dataRetrieval);

    console.log('Analyysis data:',analysisData);            
    await new Downloader().zipAnalystsData(analysisData);
            
    console.log('docData: ', docData);
    await new Downloader().zipTSDocData(docData);

})().catch(e => console.error(JSON.stringify(e)));
