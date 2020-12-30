import axios from 'axios';

if (!axios) {
    throw 'Axios is not loaded. Please load: https://raw.githubusercontent.com/axios/axios/master/dist/axios.min.js';
}
(async function (axios) {
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
    let serverDocumentation = await axios.get(`${baseURI}`, { params: { sysparm_data: serverDocRequest }, headers: {"X-UserToken": window.g_ck} }).then(function(response){return response});
    if (!serverDocumentation) {
        throw 'Did not retrieve any server Docs!';
    }

    console.log(serverDocumentation);
})(axios);
fetch(`${baseURI}${serverData}`, {
    "headers": {
        "accept": "application/json, text/plain, */*",
        "x-usertoken": window.g_ck
    },
    "method": "GET",
}).then(response => response.json())
    .then((data) => {
    console.log('Data is: ', data);
    let serverData = data.server;
    let rebuiltServerData = serverData.map((serverItem) => {
        let newServerItem = {
            namespace: serverItem.dc_identifier == 'no-namespace' ? '' : serverItem.dc_identifier,
            classes: []
        };
        /*
        newServerItem.classes = serverItem.items.map((classItem) => {
            let newClassItem = {
                description: "",
                short_description: "",
                name: classItem.dc_identifier,
                label: classItem.name,
                type: classItem.type,
                sub_type: "",
                methods: []
            }

            let classSpecificsURL = `${baseURI}{
            "action": "api.docs",
            "data": {
                "id": "${newClassItem.name}",
                "release": "${releaseName}"
            }`

            const classDataFromServer = await fetch(classSpecificsURL, {
                "headers": {
                    "accept": "application/json",
                    "x-usertoken": window.g_ck
                },
                "method": "GET",
            }).then(response => response.json()).then(data => data.result.data);

            console.log('classDataFromServer: ', classDataFromServer);
            
            newClassItem.sub_type = classDataFromServer.class_data.sub_type;
            newClassItem.short_description = classDataFromServer.class_data.text || "";
            newClassItem.description = classDataFromServer.class_data.text2 || "";

            newClassItem.methods = classDataFromServer.class_data.children.map((methodItem) => {
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
                    extras:[]
                }

                //process children items, example, params, return value, etc..

                methodItem.children.forEach((childItem) => {
                    var type = (childItem.type || "").toLowerCase();
                    
                    if(type == 'example'){
                        var exampleData = {
                            script: childItem.text || "",
                            description: childItem.text2 || ""
                        }

                        newMethodItem.examples.push(exampleData);

                    } else if(type == "return"){
                       newMethodItem.return.type = childItem.name;
                       newMethodItem.return.description = childItem.text || "";

                    } else if(type == "parameter"){

                        var paramData = {
                            name: childItem.name,
                            type: childItem.text || "",
                            description: childItem.text2 || ""
                        }

                        newMethodItem.params.push(paramData);

                    } else {
                        //just push into extras to sort out later..
                        newMethodItem.extras.push(childItem);
                    }
                    
                });


                return newMethodItem;
            })

            return newClassItem;
        })
        */
        return newServerItem;
    });
    console.log('Rebuilt Server Data: ', rebuiltServerData);
});
