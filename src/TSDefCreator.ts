import * as fs from 'fs';
import * as path from 'path';
var TurndownService = require('turndown')

var TD = new TurndownService();

const serverDataJSON = fs.readFileSync(path.resolve('.', 'SNDocData', 'paris_server.json')).toString();
const serverData: ServerItem[] = JSON.parse(serverDataJSON);

const methodReturnTypeJSON = fs.readFileSync(path.resolve('.', 'src', 'dataMaps', 'methodReturnTypes.json')).toString();
const methodReturnTypeMap: ClassMethodReturnTypeMap[] = JSON.parse(methodReturnTypeJSON);

var serverTypeDefs: string[] = [];

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
        classItemDef.push(` * @description ${fixupDescriptions(classItem.short_description)}`);
        if (classItem.description) {
            classItemDef.push(` * ${fixupDescriptions(classItem.description).replace(/\n/g, '\t\n * ')}`);
        }
        classItemDef.push(` * `);
        classItemDef.push(' */');//END JSdoc Block

        classItemDef.push(`declare class ${handleTerribleClassNames(classItem.name)} {`);

        var methodItems: string[] = [];

        classItem.methods.forEach((methodItem) => {
            let methodItemDef = [];

            let funcParams: string[] = [];
            let returnType = '';

            //BEGIN JSDoc Block
            methodItemDef.push(`/**`);
            methodItemDef.push(` * @description ${fixupDescriptions(methodItem.short_description)}`);
            if (methodItem.description) {
                methodItemDef.push(` * ${fixupDescriptions(methodItem.description).replace(/\n/g, '\n\t * ')}`);
                methodItemDef.push(` * `);
            }

            if (methodItem.examples.length > 0) {
                methodItem.examples.forEach((example) => {
                    methodItemDef.push(` * @example`);
                    methodItemDef.push(` * //${fixupDescriptions(example.description).replace(/\n/g, '\n\t * //')}`);
                    methodItemDef.push(` * ${fixupExamples(example.script)}`);
                    methodItemDef.push(` * `);
                })
            }

            if (methodItem.params.length > 0) {
                methodItem.params.forEach((param) => {
                    methodItemDef.push(` * @param ${param.name.replace('data.', '')} ${fixupDescriptions(param.description).replace(/\n/g, ` `)}`)
                    funcParams.push(`${fixupParamName(param.name)}: ${handleParamTypes(param.type)}`);
                })
                methodItemDef.push(` * `);

            }

            if (methodItem.return.type) {
                returnType = handleReturnTypes(classItem.identifier, methodItem.identifier, methodItem.return.type).newType;
                methodItemDef.push(` * @returns ${returnType} ${fixupDescriptions(methodItem.return.description).replace(/\n/g, ` `)}`);
                methodItemDef.push(` * `);
            }

            //close JSDoc Tag
            methodItemDef.push(` */`);

            //declare method with input param and type
            returnType = returnType == `` ? `` : `: ${returnType}`;

            if (methodItem.type == 'Constructor') {
                methodItem.name = 'constructor';
            }
            if(methodItem.name.indexOf('identifyCIEnhanced') > -1){
                methodItemDef.push(`identifyCIEnhanced(source: string, input: any, options: any) ${returnType}`);
            
            } else if(methodItem.name.indexOf('createOrUpdateCI') > -1){
                methodItemDef.push(`createOrUpdateCI(source: string, input: any) ${returnType}`)
            
            } else if(methodItem.name.indexOf('getTranslation') > -1){
                methodItemDef.push(`getTranslation(textToTranslate: string, parms: any) ${returnType}`)
            } else {
                methodItemDef.push(`${methodItem.name.replace(/\(.*/, '').replace(/\s/g, '')}(${funcParams.join(',')}) ${returnType}`);

            }

            methodItems.push(methodItemDef.join('\n\t'));
        })
        classItemDef.push(methodItems.join('\n\t'))
        classItemDef.push(`}`);
        serverTypeDefs.push(classItemDef.join('\n\t'));
    })


    if (serverItem.namespace) {
        //close namespace declration
        serverItemDef.push(`}`);
        serverTypeDefs.push(serverItemDef.join('\n\t'));
    } else {
        serverTypeDefs.push(serverItemDef.join('\n'));

    }

})

fs.writeFileSync(path.resolve('.', 'SNDocData', 'paris_server_converted.d.ts'), serverTypeDefs.join('\n'))

function handleParamTypes(paramType: string) {
    if (paramType == "Boolean" || paramType == "String" || paramType == "Number") {
        return paramType.toLowerCase();
    } else {
        let fixedParam = TD.turndown(paramType);
        if (fixedParam) {
            fixedParam = fixedParam.split(']')[0].replace('[', '');
        }
        return fixedParam
        .replace(/ or |\//g, '|')
        .replace(' object', '')
        .replace('field Names', 'fieldNames')
        .replace('an ISO 8601 formatted string', 'string')
        .replace('Array of Strings', 'string[]')
        .replace('Array of numbers', 'number[]');
    }
}

function fixupDescriptions(description: string) {
    var markdown = TD.turndown(description || "") + "";
    return markdown.replace(/\/\*[\W\w]*\*\//gm, '').replace(/\/\*\*[\W\w]*\*\//gm, '');
}

function fixupExamples(example: string){
    return example.replace(/\/\*[\W\w]*\*\//gm, '').replace(/\/\*\*[\W\w]*\*\//gm, '').replace(/\n/g, `\n\t * `);
}

function fixupParamName(paramName: string){
    return paramName
    .replace('function', 'jsFunction')
    .replace('data.', '')
    .replace('field Names', 'fieldNames')
    .replace('input.', '')
    .replace('input.items.', '')
    .replace('.<field value>', '')
    .replace('Array of numbers', 'number[]')
    .replace('scopeName.flowName', 'flowName')
    .replace(/\.*/g, '');
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
    if (returnType == "Boolean" || returnType == "String" || returnType == "Number") {
        return {
            classIdentifier: "",
            methodIdentifier: "",
            oldType: "",
            newType: returnType.toLowerCase()
        };
    } else {

        returnType = TD.turndown(returnType).split(']')[0].replace('[', '');
        var typeMaps: ClassMethodReturnTypeMap[] = [
            {
                classIdentifier: "ActionAPIBoth",
                methodIdentifier: "Action_getGlideURI",
                oldType: "Object",
                newType: "GlideURI"
            }
        ]

        var newTypeMap = typeMaps.find((item) => item.classIdentifier == classIdentifier && item.methodIdentifier == methodIdentifier && item.oldType == returnType);
        if (newTypeMap) {
            return newTypeMap;
        } else {
            return <ClassMethodReturnTypeMap>{
                classIdentifier: "",
                methodIdentifier: "",
                oldType: "",
                newType: fixupReturnType(returnType.trim())
            }
        }
    }
}

function fixupReturnType(returnType: string ){

    return returnType.replace('JSON key/value pairs', 'any')
    .replace(/ or |\//g, ' | ')
    .replace(' object ', '')
    .replace('Scoped ', 'Scoped')
    .replace('messages', '')
    .replace('JSON object', 'any')
    .replace(' object', '')
    .replace('JSON Array', 'strin[]')
    .replace('<String>.relations.sysId', 'string')
    .replace('<String>.summary.<class\\_name>.warningCount', 'number')
    .replace(' - Scoped, Global', '');

}

function handleTerribleClassNames(className: string) {
    let classNameMap = [
        {
            crappeName: "Action - Scoped, Global",
            newName: "Action"
        }
    ]

    let newNameMap = classNameMap.find(nameMap => nameMap.crappeName == className);
    let newName = className;
    if (newNameMap) {
        newName = newNameMap.newName;
    }

    return newName.replace(/\W/g, '');

}

function fixTypes(type: string) {
    return TD(type) + '';
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
