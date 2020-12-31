declare interface SNServerDocData {
    data: {
        client: [],
        client_mobile: [],
        rest: [],
        server: SNNamespaceItem[],
        server_legacy: []
    }
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

declare interface SNClassResponse {
    data: {
        result: {
            data: SNClassData
        }
    }
}

declare interface SNClassData {
    blurb: string,
    class_data: SNClassDataDetail,
    sub_type: string,
    type: string,
    other_releases: string[],
    release: string
}

declare interface SNClassDataDetail {
    children: SNClassMethodDetail[],
    dc_identifier: string,
    name: string,
    namespace_id: string,
    release: string,
    text: string,
    text2: string,
    type: string,
    sub_type: string,

}

declare interface SNClassMethodDetail {
    dc_identifier: string,
    children: SNClassMethodSpecifics[],
    has_example: boolean,
    has_return: boolean,
    name: string,
    text: string,
    text2: string,
    type: "Cosntructor" | "Method",
}

declare interface SNClassMethodSpecifics {
    name: string,
    type: "Return" | "Example" | "Parameter",
    sectionHeader: string,
    tableHeader: string,
    text: string,
    text2: string
}