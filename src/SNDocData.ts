declare const window: any
import { ServerScopedConverted } from '../@Types/snDocsSite/serverScopedConverted'
import { ServerScopedCall } from '../@Types/snDocsSite/serverScopedCall';
import TurndownService = require('turndown');


export class SNDocData {

    constructor() {

    }

    async getScopedServerDocData(releaseName: string): Promise<ServerScopedConverted.ServerNamespaceItem[]> {

        let nameSpacesRequest = {
            action: "api.navlist",
            data: {
                navbar: "server",
                release: releaseName
            }
        };

        const nameSpaceDocs = await this.getSNDevPortalData<ServerScopedCall.NavData>(nameSpacesRequest).catch((e: any) => { throw e }); //await fetch(url, {headers: headers}).then((resp) => resp.json())
        console.log('nameSpaceDocs Response: ', nameSpaceDocs);

        if (!nameSpaceDocs || !nameSpaceDocs.server || nameSpaceDocs.server.length == 0) {
            throw new Error("Did not retrieve any server Docs!");
        }

        const convertedNameSpaces = nameSpaceDocs.server.map(async (nameSpaceItem) => {
            let newNameSpaceItem: ServerScopedConverted.ServerNamespaceItem = {
                identifier: nameSpaceItem.dc_identifier,
                namespace: nameSpaceItem.dc_identifier == "no-namespace" ? "" : nameSpaceItem.name,
                classes: []
            }

            const tdService = new TurndownService();


            if (nameSpaceItem.items && nameSpaceItem.items.length > 0) {

                var newServerItemClasses = nameSpaceItem.items.map(async (classItem) => {

                    let newClassItem: ServerScopedConverted.ServerClassItem = {
                        description: "",
                        short_description: "",
                        identifier: classItem.dc_identifier,
                        name: this.fixClassName(classItem.dc_identifier, classItem.name),
                        constName: this.getConstName(classItem.dc_identifier),
                        extensionName: this.getExtensionKey(classItem.dc_identifier),
                        constructor: undefined,
                        methods: [],
                        properties: [],
                        extras: []
                    }

                    let classSpecificData = {
                        action: "api.docs",
                        data: {
                            id: newClassItem.identifier,
                            release: releaseName
                        }
                    }

                    let classDataFromServer = await this.getSNDevPortalData<ServerScopedCall.SNClassResponse>(classSpecificData);

                    if (classDataFromServer && classDataFromServer.result && classDataFromServer.result.data) {
                        let classData: ServerScopedCall.SNClassDataDetail = classDataFromServer.result.data.class_data;

                        newClassItem.short_description = tdService.turndown(classData.text || "");
                        newClassItem.description = tdService.turndown(classData.text2 || "");

                        if (classData.children && classData.children.length > 0) {

                            //first find the constructor, and tear it out of the children... then map the remaining into methods..
                            const classChildren = classData.children;

                            classChildren.forEach((methodItem) => {

                                var propertyType = methodItem.type;

                                var newMethodItem: ServerScopedConverted.ServerMethodItem = {
                                    identifier: methodItem.dc_identifier,
                                    short_description: tdService.turndown(methodItem.text || ""),
                                    description: tdService.turndown(methodItem.text2 || ""),
                                    name: methodItem.name,
                                    type: methodItem.type,
                                    examples: [],
                                    params: [],
                                    return: {
                                        type: "",
                                        description: ""
                                    },
                                    extras: []
                                };

                                const methodDetails = methodItem.children;

                                //process children items, example, params, return value, etc..
                                if (methodDetails && methodDetails.length > 0) {
                                    methodItem.children.forEach((methodDetail) => {
                                        var type = methodDetail.type


                                        if (type == 'Example') {
                                            var exampleData: ServerScopedConverted.ServerMethodExampleItem = {
                                                order: methodDetail.order,
                                                script: tdService.turndown(methodDetail.text || ""),
                                                description: tdService.turndown(methodDetail.text2 || "")
                                            }

                                            newMethodItem.examples.push(exampleData);

                                        } else if (type == "Return") {
                                            newMethodItem.return.type = methodDetail.name;
                                            newMethodItem.return.description = tdService.turndown(methodDetail.text || "");

                                        } else if (type == "Parameter") {
                                            var paramData: ServerScopedConverted.ServerMethodParamItem = {
                                                order: methodDetail.order,
                                                name: methodDetail.name,
                                                type: methodDetail.text || "",
                                                description: tdService.turndown(methodDetail.text2 || "")
                                            }

                                            newMethodItem.params.push(paramData);

                                        } else {
                                            //just push into extras to sort out later..
                                            newMethodItem.extras.push(methodDetail);
                                        }

                                    });
                                }

                                if(propertyType == "Property"){
                                    newClassItem.properties.push(newMethodItem);
                                } else if(propertyType == "Constructor") {
                                    newClassItem.constructor = newMethodItem;
                                } else if(propertyType == "Method"){
                                    newClassItem.methods.push(newMethodItem);
                                } else {
                                    newClassItem.extras.push(newMethodItem);
                                }
                            })
                        }
                    }

                    return newClassItem;

                })
                console.log('promise alling!')
                var promResult = await Promise.all(newServerItemClasses);
                newNameSpaceItem.classes = promResult;
                console.log('done promise.alling!', promResult)
            }

            return newNameSpaceItem;

        });

        var finalData: any = await Promise.all(convertedNameSpaces);
        //console.log(`${releaseName}: `, JSON.stringify(finalData, null, 4));

        return finalData;

    }



    async getActiveVersions(): Promise<string[]> {
        const releaseURL = `/api/snc/v1/dev/releaseInfo?sysparm_data={"action":"release.versions","data":{}}`;

        return fetch(releaseURL).then((resp) => resp.json()).then(data => data.result.data.version_selector.active_versions).catch(e => { throw e });
    }

    getDefaultHeaders(): Headers {
        const heads = new Headers();
        heads.set("accept", "application/json");
        heads.set("x-usertoken", window.g_ck);

        return heads;
    }

    getSNDevPortalData<T>(data: any): Promise<T> {

        let res: Promise<T>;
        const urlParams = new URLSearchParams();
        urlParams.set('sysparm_data', JSON.stringify(data));
        const uri = `/devportal.do?${urlParams.toString()}`
        res = fetch(uri, { headers: this.getDefaultHeaders() }).then(resp => resp.json()).then((data) => data);

        return res;


    }

    /**
     * 
     * @param identifier 
     */
    getConstName(identifier: string) {
        //this will be a simple map of "identifier" to get if there is a "const" that should be declared for it

        const map:{identifier:string, constName:string}[] = require("./snDocDataMaps/getConstNameMap.json");

        var mapItem = map.find(ident => identifier == ident.identifier);
        if (mapItem) {
            return mapItem.constName;
        }
        return undefined;
    }

    /**
     * 
     * @param identifer The dc_identifier of the class to convert to a "proper name"
     */
    fixClassName(identifer: string, className: string) {

        
        const map:{identifer:string, className:string}[] = require('./snDocDataMaps/fixClassNameMap.json');

        var res;

        var mapItem = map.find(ident => identifer == ident.identifer);
        if (mapItem) {
            res = mapItem.className;
        }

        if (!mapItem) {
            //if we didn't find it in the map, we likely just need to do some standard fixing cause SN likes to be weird... 
            let fixedClassName = className;
            fixedClassName = fixedClassName.replace(' - Scoped, Global', '');
            fixedClassName = fixedClassName.replace(' API', ''); //yea they love throwing "api" on the names..

            res = fixedClassName;
        }

        //finally if still no res... set it to incoming class name

        if (!res) {
            res = className;
        }

        return res;

    }

    getExtensionKey(identifer: string) {

        const map:{identifier:string, extensionName:string}[] = require('./snDocDataMaps/getExtensionKeyMap.json');

        var mapItem = map.find(ident => identifer == ident.identifier);
        if (mapItem) {
            return mapItem.extensionName;
        }

        return undefined;
    }

    /**
     * Handle SN's goofy param types where they randomly decide to through HTML in there?
     * @param identifier 
     */
    handleClassPropertyTSTypes(identifier:string){

        //propertyTypes 

        const map:{identifier:string, type:string}[] = require('./snDocDataMaps/handleClassPropertyTSTypes.json');
    }

    convertSNTypesToTSTypes(identifier:string, type:string){

        var res = type || '';

        //look in map...
        if(identifier){
            const map:{identifier:string, type:string}[] = require('./snDocDataMaps/snTypesToTSTypes.json');

            let mappedItem = map.find((item) => item.identifier == identifier);
            if(mappedItem){
                res = mappedItem.type;
            } else if(identifier.indexOf('GQ_') == 0){
                res = 'any'; //<--- GlideQuery... a ScriptInclude made it to docs site... It looks like a mess, so it can return "any" type..
            }
        }

        //cleanup SN's generic types..
        if(res){
            if(type === 'object'){
                res = 'Object';
            }

            if(type === 'String'){
                res = 'string';
            }

            if(type.toLowerCase() === 'strings'){
                res = 'string'; //i know this one is weird..
            }

            if(type.toLowerCase() === 'none'){
                res = 'void';
            }

            if(type === 'Number'){
                res = 'number';
            }

            if(type === 'Boolean'){
                res = 'boolean';
            }

            if(type.toLowerCase() === 'integer' || type.toLowerCase() == 'decimal'){
                res = 'number';
            }

            if(type.toLowerCase() === 'array'){
                res = 'string[]'; 
            }


        }

        //handle other random cleanup..

        res = res.replace('Scoped ', ''); //they throw this on cause global scope copies that are different exist... but for us we clear..

        return res;
        
    }
}

