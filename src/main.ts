import { SNDocData } from "./SNDocData";
import { ServerScopedConverted } from '../@Types/snDocsSite/serverScopedConverted';
import { Downloader } from './downloader';
declare var window: any

(async function () {
    const snDocUtil = new SNDocData();
    let activeVersions = await snDocUtil.getActiveVersions();
    console.log('Active versions: ', activeVersions);
    let latestVersion = activeVersions.pop();

    // Prepping for "Get everything!";
    /*
    let docData = [];
    let analysisData = [];

    let uniqueVersionCalls = activeVersions.forEach(async (version) => {

    });*/

    if (latestVersion) {
        let result:ServerScopedConverted.ServerNamespaceItem[] | undefined;
        if(window.snichTestData){
            result = window.snichTestData;
        } else {
            result = await snDocUtil.getScopedServerDocData(latestVersion);
            window.snichTestData = result;
        }
        
        console.log('result: ', result);
        if (result) {

            await new Downloader().zipSNDocData([{releaseName:latestVersion,data:result}]);

            let analysisData = [{
                uniqueItemList: snDocUtil.getUniqueItemList(),
                dataNotMapped: snDocUtil.getDataNotMapped()
            }]

            await new Downloader().zipAnalystsData([{releaseName:latestVersion, data:analysisData}])

            console.log(analysisData)

        }
    }

})().catch(e => console.error(JSON.stringify(e)));
