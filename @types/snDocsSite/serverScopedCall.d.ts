declare interface SNServerDocData {
    client: [],
    client_mobile: [],
    rest: [],
    server: SNNamespaceItem[],
    server_legacy: []
}

declare interface SNDocItem {
    dc_identifier: string,
    name: string,
    type: string,
    items: SNNamespaceItem[]
}

declare interface SNNamespaceItem extends SNDocItem {
    items: SNClassItem[]
}

declare interface SNClassItem extends SNDocItem {
    items: SNClassMethodItem[]
}

declare interface SNClassMethodItem extends SNDocItem {
    
}