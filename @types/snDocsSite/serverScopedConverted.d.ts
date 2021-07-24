export namespace ServerScopedConverted {

    interface ServerNamespaceItem {
        identifier: string
        namespace: string
        classes: ServerClassItem[]
    }
    
    interface ServerClassItem {
        identifier: string
        description: string
        short_description: string
        name: string
        constName?: string
        extensionName?: string
        constructor: ServerMethodItem | undefined
        methods: ServerMethodItem[]
        properties: ServerMethodItem[]
        extras: ServerMethodItem[]
    }

    interface SNConstructor {
        params: ServerMethodParamItem[]
    }
    
    interface ServerMethodItem {
        identifier: string
        short_description: string
        description: string
        name: string
        type: string
        examples: ServerMethodExampleItem[]
        params: ServerMethodParamItem[]
        return: ServerMethodReturnItem
        extras: any[]
    }

    
    interface ServerMethodExampleItem {
        order: number | undefined
        script: string
        description: string
    }
    
    interface ServerMethodReturnItem {
        type: string
        description: string
    }
    
    interface ServerMethodParamItem {
        order: number | undefined
        name: string
        type: string
        description: string
    }
}