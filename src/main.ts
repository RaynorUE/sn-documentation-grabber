import { SNDocData } from "./SNDocData";
import { ServerScopedConverted } from '../@Types/snDocsSite/serverScopedConverted';
import { Downloader } from './downloader';
declare var window: any

(async function () {
    const snDocUtil = new SNDocData();
    let activeVersions = await snDocUtil.getActiveVersions();
    console.log('Active versions: ', activeVersions);
    let latestVersion = activeVersions.pop();
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
            let nameSpaceNames: any[] = [];
            let classNames: any[] = [];
            let methodReturnTypes: any[] = [];
            let methodParamTypes: any[] = [];
            let propertyTypes: any[] = [];

            result.forEach((nameSpaceData) => {
                
                nameSpaceNames.push({
                    name: nameSpaceData.namespace + '',
                    identifier: nameSpaceData.identifier + ''
                });

                nameSpaceData.classes.forEach((classItem) => {
                    classNames.push({
                        name: classItem.name + '',
                        identifier: classItem.identifier + ''
                    });
                    classItem.methods.forEach((method) => {
                        if(!methodReturnTypes.find(type => type.type == method.return.type)){
                            methodReturnTypes.push({identifier: method.identifier, type: method.return.type});
                        }
                        method.params.forEach((param) => {
                            if(!methodParamTypes.find(type => type.type == param.type)){
                                methodParamTypes.push({identifier: method.identifier, type:param.type});
                            }
                        })
                    })
                    classItem.properties.forEach((property) => {
                        property.params.forEach((param) => {
                            //should only "Types" here..
                            if(!propertyTypes.find(prop => prop.type == param.type)){
                                propertyTypes.push({classId: classItem.identifier, type:param.type, propData: property});
                            }
                        })
                        //propertyTypes.push({classId: classItem.identifier, propData: property});
                        /*
                        if(!propertyTypes.find(type => type.type == property.type)){
                            propertyTypes.push({classId: classItem.identifier, propData: property});
                        }*/
                    })


                })
                /*
                const fileName = fixUpFileName((nameSpaceData.namespace || "no-namespace") + '.json');
                const dLink = document.createElement("a");
                dLink.style.display = "none";

                dLink.href = window.URL.createObjectURL(
                    new Blob([JSON.stringify(nameSpaceData, null, '\t')], { type: "text/plain" })
                )

                dLink.setAttribute('download', fileName); //really need this at the TS level..

                document.body.appendChild(dLink);
                dLink.click();
                window.URL.revokeObjectURL(dLink.href);
                document.body.removeChild(dLink);
                */

            })

            await new Downloader().zipSNDocData(latestVersion,result);

            console.log({ nameSpaceNames: nameSpaceNames, classNames: classNames, methodReturnTypes:methodReturnTypes, propertyTypes:propertyTypes, methodReturnsNotMapped: snDocUtil.getReturnTypesNotMapped(), methodParamTypes: methodParamTypes, methodParamTypesNotMapped: snDocUtil.getParamTypesNotMapped()})

        }
    }

})().catch(e => console.error(JSON.stringify(e)));
