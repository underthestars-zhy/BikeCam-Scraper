import axios from "axios";
import {TokenManager} from "./token-manager";
import * as fs from 'fs';
import {DataManager} from "./data-manager";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
    retries: 3, // Number of retry attempts
    retryDelay: axiosRetry.exponentialDelay,
})

export class TaskManager {
    private static instance: TaskManager;

    private constructor() {
        this.requestMapData().then()
        setInterval(() => this.requestMapData().then(), 1000 * 60);
    }

    static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    private async requestMapData() {
        const response = await axios.post('https://account.bluebikes.com/bikesharefe-gql', {
            "query": "query GetSystemSupply($input: SupplyInput) {\n  supply(input: $input) {\n    stations {\n      stationId\n      stationName\n      location {\n        lat\n        lng\n        __typename\n      }\n      bikesAvailable\n      bikeDocksAvailable\n      ebikesAvailable\n      scootersAvailable\n      totalBikesAvailable\n      totalRideablesAvailable\n      isValet\n      isOffline\n      isLightweight\n      notices {\n        ...NoticeFields\n        __typename\n      }\n      siteId\n      ebikes {\n        batteryStatus {\n          distanceRemaining {\n            value\n            unit\n            __typename\n          }\n          percent\n          __typename\n        }\n        __typename\n      }\n      scooters {\n        batteryStatus {\n          distanceRemaining {\n            value\n            unit\n            __typename\n          }\n          percent\n          __typename\n        }\n        __typename\n      }\n      lastUpdatedMs\n      __typename\n    }\n    rideables {\n      rideableId\n      location {\n        lat\n        lng\n        __typename\n      }\n      rideableType\n      batteryStatus {\n        distanceRemaining {\n          value\n          unit\n          __typename\n        }\n        percent\n        __typename\n      }\n      __typename\n    }\n    notices {\n      ...NoticeFields\n      __typename\n    }\n    requestErrors {\n      ...NoticeFields\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment NoticeFields on Notice {\n  localizedTitle\n  localizedDescription\n  url\n  __typename\n}",
            "variables": {
                "input": {
                    "regionCode": "BOS",
                    "rideablePageLimit": 1000
                }
            },
            "operationName": "GetSystemSupply"
        }, {
            "headers": TokenManager.getInstance().generateHeader()
        })

        const currentTime = new Date().getTime()

        const mapEntry: MapTable = {
            time: currentTime,
            bikes: response.data['data']['supply']['stations'].map((s: any) => ({
                location: {
                    lat: s['location']['lat'],
                    lng: s['location']['lng']
                },
                count: s['totalRideablesAvailable'],
            }))
        }

        const filePath = `./data/${currentTime}.json`;
        fs.writeFileSync(filePath, JSON.stringify(mapEntry, null, 2));

        let currentReal: MapTable[] = await DataManager.getInstance().getRealData()
        currentReal.push(mapEntry)
        if (currentReal.length > 15) {
            currentReal.shift()
        }
        await DataManager.getInstance().setRealData(currentReal)

        console.log('save real data')

        if (currentReal.length >= 15) {
            console.log('started predict')
            const predictionResponse = await axios.post('http://127.0.0.1:9901/predict', currentReal)
            await DataManager.getInstance().setPredictedData(predictionResponse.data)
        }
    }
}