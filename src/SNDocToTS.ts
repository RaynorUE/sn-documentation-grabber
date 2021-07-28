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
            let constExtensionsAtEnd:string[] = [];

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

                if(classItem.extensionName){
                    constExtensionsAtEnd.push(`declare class ${classItem.extensionName} extends ${classItem.name}{}`)
                }

                if(classItem.constName){
                    classItem.name = classItem.identifier;
                    constExtensionsAtEnd.push(`declare const ${classItem.constName}: ${classItem.name}`);
                }

                //begin JSDoc
                TSContent.push(`${tabs}/** `);
                if (classItem.description) {
                    TSContent.push(`${tabs} * ${this.convertMultiLineComment(tabs, classItem.description)}`);
                    TSContent.push(`${tabs} * `); //space after description
                }

                //Examples for class... Are their examples for class? I guess just in case...
                if (classItem.examples.length > 0) {
                    TSContent.push(`${tabs} *`);//space before examples..

                    classItem.examples.forEach((example) => {
                        if (example.description) {
                            //fixup description..
                            example.description = this.convertMultiLineComment(tabs, example.description);
                        }
                        TSContent.push(`${tabs} * @example ${example.description}`);
                        TSContent.push(`${tabs} * `); //space after description
                        if (example.script) {
                            let fixedScript = this.convertMultiLineComment(tabs, example.script);
                            TSContent.push(`${tabs} * ${fixedScript}`);
                        }

                    })

                    TSContent.push(`${tabs} * `); //space after examples..
                }

                //Handle Params? Or those are part of the constructor..? Oh yea... they are...


                //close JSDoc Block
                TSContent.push(`${tabs} */`);

                //Open class
                let declareWord = nameSpace.identifier == 'no-namespace' ? 'declare ' : '';
                TSContent.push(`${tabs}${declareWord}class ${classItem.name} {`);
                TSContent.push(`${tabs}`)

                //increase tabs..
                tabs += '\t';

                //Constructor if exists.
                if (classItem.constructor) {
                    const constructorFunc = classItem.constructor;
                    const constructorParams = this.buildFuncParams(constructorFunc.params);

                    //JSDoc Block open

                    TSContent.push(`${tabs}/**`);
                    TSContent.push(`${tabs} *`);
                    if (constructorFunc.params) {
                        constructorFunc.params.sort((a, b) => a.order > b.order ? 1 : -1).forEach((param) => {
                            TSContent.push(`${tabs} * @param {${param.type}} ${param.name} ${this.convertMultiLineComment(tabs, param.description)}`);
                        });
                    }
                    //JSDoc Block close
                    TSContent.push(`${tabs} *`);
                    TSContent.push(`${tabs} */`);


                    //declare constructor
                    let returnType = '';
                    if (constructorFunc.return.type) {
                        returnType = `: ${constructorFunc.return.type}`;
                    }
                    TSContent.push(`${tabs}constructor(${constructorParams})${returnType}`);
                    TSContent.push(`${tabs}`);
                }

                //now work through properties...
                classItem.methods.forEach((methodItem) => {

                    //start JSDoc
                    TSContent.push(`${tabs}/**`);
                    TSContent.push(`${tabs} *`);
                    if (methodItem.short_description) {
                        TSContent.push(`${tabs} * ${this.convertMultiLineComment(tabs, this.convertMultiLineComment(tabs, methodItem.short_description))}`);
                        TSContent.push(`${tabs} *`);
                    }

                    if (methodItem.description) {
                        TSContent.push(`${tabs} * ${this.convertMultiLineComment(tabs, this.convertMultiLineComment(tabs, methodItem.description))}`);
                        TSContent.push(`${tabs} *`);
                    }

                    if (methodItem.params) {
                        methodItem.params.sort((a, b) => a.order > b.order ? 1 : -1).forEach((param) => {
                            TSContent.push(`${tabs} * @param {${param.type}} ${param.name} ${this.convertMultiLineComment(tabs, param.description)}`);
                        });
                        TSContent.push(`${tabs} *`);
                    }

                    if (methodItem.return.type) {
                        TSContent.push(`${tabs} * @returns {${methodItem.return.type}} ${this.convertMultiLineComment(tabs, methodItem.return.description)}`);
                    }

                    //close JSDoc Block
                    TSContent.push(`${tabs} */`);

                    //declare function? what if I am a property?

                    if (methodItem.type == 'Method') {
                        let returnType = '';
                        if (methodItem.return.type) {
                            returnType = `: ${methodItem.return.type}`;
                        }
                        TSContent.push(`${tabs}${methodItem.name}(${this.buildFuncParams(methodItem.params)})${returnType}`);
                    }

                    if (methodItem.type == 'Property') {
                        let returnType = '';
                        if (methodItem.return.type) {
                            returnType = `: ${methodItem.return.type}`;
                        }

                        TSContent.push(`${tabs}${methodItem.name}${returnType}`);
                    }



                    TSContent.push(`${tabs}`);

                })

                //now work through methods....

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

            TSContent = TSContent.concat(constExtensionsAtEnd);

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
    private buildFuncParams(paramsList: ServerScopedConverted.ServerMethodParamItem[]): string {

        if (paramsList.length === 0) {
            return '';
        }

        return paramsList
            .sort((param1, param2) => param1.order > param2.order ? 1 : -1).filter((param) => param.name.indexOf('.') == -1)
            .map((param) => {
                //fixup paramNames cause SN still whack-a-do
                let paramName = param.name.replace(/\s/g, '');
                if(paramName == 'function'){
                    paramName = 'func';
                }
                return `${paramName}: ${param.type}`;
            }).join(', ');


    }

    private convertMultiLineComment(tabs: string, text: string) {
        text = text.replace(/\n/g, `\n${tabs} * `)
        text = text.replace(/\\/g, '')
        text = text.replace(/\/\*[0-9\$\_a-zA-Z]+\*\//, '');
        return text;
    }
}

export interface TSDocResult {
    namespace: string
    content: string[]
}