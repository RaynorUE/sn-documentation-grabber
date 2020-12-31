declare interface ServerItem {
    identifier: string,
    namespace: string,
    classes: Promise<ServerClassItem>[]
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

}