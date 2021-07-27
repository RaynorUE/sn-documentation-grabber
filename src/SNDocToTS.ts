import { ServerScopedConverted} from '../@Types/snDocsSite/serverScopedConverted'
export class SNDocToTS {

    /**
     * 
     * @param serverData 
     */
    convertServerToTS(serverData:ServerScopedConverted.ServerNamespaceItem[]){

        let convertedNamespaces:{namespace:string, content:string[]}[] = [];

        serverData.forEach((nameSpace) => {
            let tsConversion = {
                namespace: "",
                content: []
            }

            let TSContent:string[] = [];
            let tabs = ''; //keep track of layers and use this to determine our tabs.. That's right, tabs over spaces!
            let constExtensionsAtEnd = [];
            
            //open NameSpace
            TSContent.push(`${tabs}declare namespace ${nameSpace.namespace} {`);
            TSContent.push(`${tabs}`);

            //begin declaring classes!

            const classes = nameSpace.classes;

            tabs += '\t';
            classes.forEach((classItem) => {
                //begin JSDoc
                TSContent.push(`${tabs}/** `);
                if(classItem.description){
                    TSContent.push(`${tabs} * ${classItem.description}`);
                    TSContent.push(`${tabs} * `); //space after description
                }
                
                if(classItem.examples.length > 0){
                    TSContent.push(`${tabs} *`);//space before examples..

                    classItem.examples.forEach((example) => {
                        if(example.description){
                            //fixup description..
                            example.description = example.description.replace(/\n/g, `\n${tabs} * `);
                        }
                        TSContent.push(`${tabs} * @example ${example.description}`);
                        TSContent.push(`${tabs} * `); //space after description
                        if(example.script){
                            let fixedScript = example.script.replace(/\n/, `${tabs} * `);
                            TSContent.push(`${tabs} * ${fixedScript}`);
                        }
                        
                    })

                    TSContent.push(`${tabs} * `); //space after examples..

                }
                
                TSContent.push(`${tabs}declare class ${classItem.name} {` );
                TSContent.push(`${tabs}`)
                
            })








            //Close nameSpace
            TSContent.push(`}`);
        })


    }
}