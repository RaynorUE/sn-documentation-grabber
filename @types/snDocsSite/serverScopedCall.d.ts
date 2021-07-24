export namespace ServerScopedCall {

    interface NavData {
        client: [],
        client_mobile: [],
        rest: [],
        server: SNNavNamespaceItem[],
        server_legacy: []
    }
    
    interface SNNavDocItem {
        dc_identifier: string,
        name: string,
        type: string,
    }
    
    interface SNNavNamespaceItem extends SNNavDocItem {
        items: SNNavClassItem[]
    }
    
    interface SNNavClassItem extends SNNavDocItem {
        dc_identifier: string,
        name: string
    }
    
    interface SNClassResponse {
        result: {
            data: SNClassData
        }
    }
    
    interface SNClassData {
        blurb: string,
        class_data: SNClassDataDetail,
        sub_type: string,
        type: string,
        other_releases: string[],
        release: string
    }
    
    interface SNClassDataDetail {
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
    
    interface SNClassMethodDetail {
        dc_identifier: string,
        children: SNClassMethodSpecifics[],
        has_example: boolean,
        has_return: boolean,
        name: string,
        text: string,
        text2: string,
        type: "Constructor" | "Method" | "Property",
    }
    
    interface SNClassMethodSpecifics {
        order: number | undefined
        name: string
        type: "Constructor" | "Return" | "Example" | "Parameter"
        sectionHeader: string
        tableHeader: string
        text: string
        text2: string
    }
}