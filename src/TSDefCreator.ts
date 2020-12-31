const fs = require('fs');
const path = require('path');
const TD = require('turndown');

var serverDataJSON = fs.readFileSync(path.resolve('.', 'SNDocData', 'paris_server.json')).toString();

var serverData: ServerItem[] = JSON.parse(serverDataJSON);

var serverTypeDefs = [];

serverData.forEach((serverItem) => {

    var serverItemDef = [];
    if (serverItem.namespace) {
        //add namespace declration;
        serverItemDef.push(`declare namespace ${serverItem.namespace} {`)
    }

  
    serverItem.classes.forEach((classItem) => {
        var classItemDef = [];

        //Start JSDoc Block
        classItemDef.push(`/**`);
        classItemDef.push(` * @description ${classItem.short_description}`);
        if(classItem.description){
            classItemDef.push(` * ${turndownDescription(classItem.description).replace(/\n/g, '\n * ')}`);
        }
        classItemDef.push(` * `);
        classItemDef.push(' */');//END JSdoc Block

        classItemDef.push(`declare class ${classItem.name} {`);

        var methodItems = [];

        classItem.methods.forEach((methodItem) => {
            let methodItemDef = [];

            //BEGIN JSDoc Block
            methodItemDef.push(`/**`);
            methodItemDef.push(` * @description ${methodItem.short_description}`);
            if(methodItem.description){
                methodItemDef.push(` * ${turndownDescription(methodItem.description).replace(/\n/g, '\n * ')}`);
                methodItemDef.push(` * `);
            }

            if(methodItem.examples.length > 0){
                methodItem.examples.forEach((example) => {
                    methodItemDef.push(` * @example`);
                    methodItemDef.push(` * //${turndownDescription(example.description).replace(/\n/g, '\n * //')}`);
                    methodItemDef.push(` * ${example.script.replace(/\n/g, `\n * `)}`);
                    methodItemDef.push(` * `);
                })
            }

            if(methodItem.params.length > 0){
                methodItem.params.forEach((param) => {
                    methodItemDef.push(` * ${param.name} ${turndownDescription(param.description).replace(/\n/g, ` `)}`);
                })
                methodItemDef.push(` * `);
            }

            if(methodItem.return.type){
                methodItemDef.push(` * @returns ${handleReturnTypes(classItem.identifier, methodItem.identifier, methodItem.return.type).newType} ${turndownDescription(methodItem.return.description).replace(/\n/g, ` `)}`);
                methodItemDef.push(` * `);
            }

            //close JSDoc Tag
            methodItemDef.push(` */`);
            
            //declare method with input param and type

        })
    })




    if (serverItem.namespace) {
        //close namespace declration
        serverItemDef.push(`}`);
    }

    //add to our list of ServerType Definitions.
    serverTypeDefs.push(serverItemDef.join('\n'));

})

function handleParamTypes(paramType: string) {
    if(paramType == "Boolean" || paramType == "String" || paramType == "Number"){
        return paramType.toLowerCase();
    } else {
        return paramType;
    }
}

function turndownDescription(description: string) {
    var markdown = TD(description || "");
    return markdown;
}

/**
 * Will run through a mapping to try and return back appropriate return types..
 * 
 * will likely need to convert this to it's own file at some point, versions per release... ugh.
 * 
 * @param classIdentifier Class name to lookup new return type for
 * @param methodIdentifier The method to lookup new return type for
 * @param returnType The "original" return type..
 */
function handleReturnTypes(classIdentifier: string, methodIdentifier: string, returnType: string): ClassMethodReturnTypeMap {

    var typeMaps: ClassMethodReturnTypeMap[] = [
        {
            classIdentifier: "ActionAPIBoth",
            methodIdentifier: "Action_getGlideURI",
            oldType: "Object",
            newType: "GlideURI"
        }
    ]

    var newTypeMap = typeMaps.find((item) => item.classIdentifier == classIdentifier && item.methodIdentifier == methodIdentifier && item.oldType == returnType);
    if(newTypeMap){
        return newTypeMap;
    } else {
        return <ClassMethodReturnTypeMap>{
            classIdentifier: "",
            methodIdentifier: "",
            oldType: "",
            newType: returnType
        }
    }
}

function handleTerribleClassNames(className: string) {
    let classNameMap = [
        {
            crappeName: "",
            newName: ""
        }
    ]
}


/**
 * Returns an array of name space extensions that should be added to the list of name space declrations
 * @param namespace 
 */
function addFlatNameSpaceExtensions(namespace: string) {

}

/**
 * Returns an array of flat class extensions for a give namespace
 * @param className 
 */
function addFlatClassExtensions(className: string) {

}
