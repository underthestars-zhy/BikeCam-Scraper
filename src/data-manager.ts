import { Mutex } from "async-mutex";

export class DataManager {
    private static instance: DataManager;
    private realData: MapTable[] = [];
    private predictedData: MapTable[] = [];
    private readonly dataLock: Mutex = new Mutex();

    private constructor() {
    }

    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    public async setRealData(data: MapTable[]): Promise<void> {
        await this.dataLock.acquire();
        try {
            this.realData = data;
        } finally {
            this.dataLock.release();
        }
    }

    public async getRealData(): Promise<MapTable[]> {
        await this.dataLock.acquire();
        try {
            return [...this.realData];
        } finally {
            this.dataLock.release();
        }
    }

    public async setPredictedData(data: MapTable[]): Promise<void> {
        await this.dataLock.acquire();
        try {
            this.predictedData = data;
        } finally {
            this.dataLock.release();
        }
    }

    public async getPredictedData(): Promise<MapTable[]> {
        await this.dataLock.acquire();
        try {
            return [...this.predictedData];
        } finally {
            this.dataLock.release();
        }
    }
}

// Usage:
// const manager = DataManager.getInstance();
// manager.addToListOne("item1");
// const listOne = manager.getListOne();