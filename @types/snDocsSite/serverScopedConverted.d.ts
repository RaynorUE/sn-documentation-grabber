declare interface ServerItem {
    identifier: string,
    namespace: string,
    classes: ServerClassItem[]
}

declare interface ServerClassItem {
    identifier: string,
    description: string,
    short_description: string,
    name: string,
    type: string,
    sub_type: string,
    methods: ServerMethodItem[]
}

declare interface ServerMethodItem {
    identifier: string,
    short_description: string,
    description: string,
    name: string,
    type: string,
    examples: ServerMethodExampleItem[],
    params: ServerMethodParamItem[],
    return: ServerMethodReturnItem,
    extras: any[]
}

declare interface ServerMethodExampleItem {
    script: string,
    description: string,
}

declare interface ServerMethodReturnItem {
        type: string,
        description: string
}

declare interface ServerMethodParamItem {
    name: string,
    type: string,
    description: string
}