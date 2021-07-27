import { ServerScopedConverted } from '../@Types/snDocsSite/serverScopedConverted'
export class SNDocToTS {

    /**
     * 
     * @param serverData 
     */
    convertServerToTS(serverData: ServerScopedConverted.ServerNamespaceItem[]) {

        let convertedNamespaces: TSDocResult[] = [];

        serverData.forEach((nameSpace) => {
            let docResult: TSDocResult = {
                namespace: `${nameSpace.namespace}`,
                content: <Array<string>>[]
            }

            let TSContent: string[] = [];
            let tabs = ''; //keep track of layers and use this to determine our tabs.. That's right, tabs over spaces!
            let constExtensionsAtEnd = [];

            //if not no-namespace open declare namespace
            if (docResult.namespace) {
                TSContent.push(`${tabs}declare namespace ${nameSpace.namespace} {`);
                TSContent.push(`${tabs}`);
                tabs += '\t';
            }

            //begin declaring classes!

            const classes = nameSpace.classes;

            //SN Declares JSON? Wonder what their purpose was, either it causes conflict so we are skipping it.
            //will figure out / deal with some other time..
            //and thankfully the described why in their description: For scoped applications, the JSON API uses static methods that call the JavaScript ES5 native JSON object.
            //also easier to skip here for now. Need to re-think the nested Asyncs I got going on in SNDoc data and just "get data, build one huge set of arrays and reloop to join it all"...
            classes.filter((item) => item.identifier != 'JSONScopedAPI').forEach((classItem) => {

                //begin JSDoc
                TSContent.push(`${tabs}/** `);
                if (classItem.description) {
                    TSContent.push(`${tabs} * ${classItem.description.replace(/\n/g, `\n${tabs} * `)}`);
                    TSContent.push(`${tabs} * `); //space after description
                }

                //Examples for class... Are their examples for class? I guess just in case...
                if (classItem.examples.length > 0) {
                    TSContent.push(`${tabs} *`);//space before examples..

                    classItem.examples.forEach((example) => {
                        if (example.description) {
                            //fixup description..
                            example.description = example.description.replace(/\n/g, `\n${tabs} * `);
                        }
                        TSContent.push(`${tabs} * @example ${example.description}`);
                        TSContent.push(`${tabs} * `); //space after description
                        if (example.script) {
                            let fixedScript = example.script.replace(/\n/, `${tabs} * `);
                            TSContent.push(`${tabs} * ${fixedScript}`);
                        }

                    })

                    TSContent.push(`${tabs} * `); //space after examples..
                }

                //Handle Params? Or those are part of the constructor..? Oh yea... they are...


                //close JSDoc Block
                TSContent.push(`${tabs} */`);

                //Open class
                TSContent.push(`${tabs}class ${classItem.name} {`);
                TSContent.push(`${tabs}`)

                //increase tabs..
                tabs += '\t';

                //Constructor if exists.
                if(classItem.constructor){
                    const constructorFunc = classItem.constructor;
                    const constructorParams = this.buildFuncParams(constructorFunc.params);

                    //JSDoc Block open

                    TSContent.push(`${tabs}/**`);
                    TSContent.push(`${tabs} *`);
                    if(constructorFunc.params){
                        constructorFunc.params.sort((a, b) => a.order > b.order ? 1 : -1).forEach((param) => {
                            TSContent.push(`${tabs} * @param {${param.type}} ${param.description}`);
                        });
                    }
                    //JSDoc Block close
                    TSContent.push(`${tabs} *`);
                    TSContent.push(`${tabs} */`);

                    
                    //declare constructor
                    let returnType = '';
                    if(constructorFunc.return.type){
                        returnType = `: ${constructorFunc.return.type}`;
                    }
                    TSContent.push(`${tabs} constructor(${constructorParams})${returnType}`);

                }



                //close class
                tabs = tabs.replace(/\t$/, ''); //remove a tab
                TSContent.push(`${tabs}}`);
                TSContent.push(`${tabs}`); //new line
            })

            if (docResult.namespace) {
                //Close nameSpace
                TSContent.push(`}`);
                tabs = tabs.replace(/\t$/, ''); //remove a tab
            }

            docResult.content = TSContent;

            convertedNamespaces.push(docResult);
        })

        return convertedNamespaces;

    }


    /**
     * Used to build the function parameters based on the params list provided.
     * 
     * For example, myFunc(${params}) needs to be myFunc(param1:string, param2:string[], etc);
     */
    private buildFuncParams(paramsList:ServerScopedConverted.ServerMethodParamItem[]): string{

        if(paramsList.length === 0){
            return '';
        }
        
        return paramsList
        .sort((param1, param2) => param1.order > param2.order ? 1 : -1)
        .map((param) => `${param.name}: ${param.type}`).join(', ');

        
    }
}

export interface TSDocResult {
    namespace: string
    content: string[]
}