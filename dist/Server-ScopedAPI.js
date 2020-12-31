import axios from 'axios';
if (!axios) {
    throw 'Axios is not loaded. Please load: https://raw.githubusercontent.com/axios/axios/master/dist/axios.min.js';
}
(async function () {
    const releasesURL = `https://developer.servicenow.com/api/snc/v1/dev/releaseInfo?sysparm_data={"action":"release.versions","data":{}}`;
    //"Active Versions" should be whats pulled..  Inactive versions if you want to "build it all"..? Nah...
    const baseURI = `/devportal.do`;
    const releaseName = 'paris';
    //Data request for "Name Spaces && Classes";
    var serverDocRequest = `{
        "action": "api.navlist",
        "data": {
            "navbar": "server",
            "release": "${releaseName}"
        }
    }`;
    //data request for "Specific Class"??
    var specificClassData = `{
        "action": "api.docs",
        "data": {
            "id": "ActionAPIBoth",
            "release": "${releaseName}"
        }
    }`;
    axios.defaults.headers.common["X-UserToken"] = window.g_ck;
    let nameSpaceDocs = await axios.get(`${baseURI}`, { params: { sysparm_data: serverDocRequest } });
    console.log('nameSpaceDocs Response: ', nameSpaceDocs);
    if (!nameSpaceDocs.data || !nameSpaceDocs.data.server || nameSpaceDocs.data.server.length == 0) {
        console.error("Did not retrieve any server Docs!");
        return;
    }
    var newServerNameSpaces = nameSpaceDocs.data.server.map(async (nameSpaceItem) => {
        let newServerItem = {
            identifier: nameSpaceItem.dc_identifier,
            namespace: nameSpaceItem.dc_identifier == "no-namespace" ? "" : nameSpaceItem.name,
            classes: []
        };
        if (nameSpaceItem.items && nameSpaceItem.items.length > 0) {
            newServerItem.classes = nameSpaceItem.items.map(async (classItem) => {
                let newClassItem = {
                    description: "",
                    short_description: "",
                    identifier: classItem.dc_identifier,
                    name: classItem.name,
                    type: classItem.type,
                    sub_type: "",
                    methods: []
                };
                let classSpecificData = `{
                "action": "api.docs",
                "data": {
                    "id": "${classItem.dc_identifier}",
                    "release": "${releaseName}"
                }
            }`;
                let classDataFromServer = await axios.get(baseURI, { params: { sysparm_data: classSpecificData } });
                if (classDataFromServer.data && classDataFromServer.data.result && classDataFromServer.data.result.data) {
                    let classData = classDataFromServer.data.result.data;
                    newClassItem.sub_type = classData.class_data.sub_type;
                    newClassItem.short_description = classData.class_data.text || "";
                    newClassItem.description = classData.class_data.text2 || "";
                    if (classData.class_data.children && classData.class_data.children.length > 0) {
                        newClassItem.methods = classData.class_data.children.map((methodItem) => {
                            var newMethodItem = {
                                name: methodItem.dc_identifier,
                                short_description: methodItem.text || "",
                                description: methodItem.text2 || "",
                                label: methodItem.name,
                                type: methodItem.type,
                                examples: [],
                                params: [],
                                return: {
                                    type: "",
                                    description: ""
                                },
                                extras: []
                            };
                            //process children items, example, params, return value, etc..
                            if (methodItem.children && methodItem.children.length > 0) {
                                methodItem.children.forEach((childItem) => {
                                    var type = (childItem.type || "").toLowerCase();
                                    if (type == 'example') {
                                        var exampleData = {
                                            script: childItem.text || "",
                                            description: childItem.text2 || ""
                                        };
                                        newMethodItem.examples.push(exampleData);
                                    }
                                    else if (type == "return") {
                                        newMethodItem.return.type = childItem.name;
                                        newMethodItem.return.description = childItem.text || "";
                                    }
                                    else if (type == "parameter") {
                                        var paramData = {
                                            name: childItem.name,
                                            type: childItem.text || "",
                                            description: childItem.text2 || ""
                                        };
                                        newMethodItem.params.push(paramData);
                                    }
                                    else {
                                        //just push into extras to sort out later..
                                        newMethodItem.extras.push(childItem);
                                    }
                                });
                            }
                            return newMethodItem;
                        });
                    }
                }
                return newClassItem;
            });
        }
        console.log('promise alling!');
        var promResult = await Promise.all(newServerItem.classes);
        newServerItem.classes = promResult;
        console.log('done promise.alling!', promResult);
        return newServerItem;
    });
    var test = await Promise.all(newServerNameSpaces);
    console.log('New Server Name Spaces promise all test: ', test);
})();
