interface MapTable {
    time: number
    bikes: {
        location: {
            lat: number,
            lng: number
        },
        count: number
    }[]
}