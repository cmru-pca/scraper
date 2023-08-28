export type DataFileType = {
    data: {
        id: string,
        name: string,
        major: string,
        url: string,
        like: {
            value: number,
            data: number[]
        },
        share: {
            value: number,
            data: number[]
        },
        point: {
            value: number,
            data: number[]
        }
    }[]
    updatedAt: Date
}

export type HistoryFileType = {
    updatedAt: Date
}
