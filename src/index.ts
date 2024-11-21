import { Elysia } from "elysia";
import {TokenManager} from "./token-manager";
import { DataManager } from "./data-manager";

TokenManager.getInstance()

const app = new Elysia()
  .get('/', async () => {
    const realData = await DataManager.getInstance().getRealData()
    const predictedData = await DataManager.getInstance().getPredictedData()

    return {
      real: realData,
      predicted: predictedData
    }
  })
  .listen(9902);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
