import {Elysia, t} from "elysia";
import {TokenManager} from "./token-manager";
import {DataManager} from "./data-manager";
import {isNearBy} from "./geo";

TokenManager.getInstance()

const app = new Elysia()
  .post('/', async ({body: {lat, lng}}) => {
    const realData = await DataManager.getInstance().getRealData()
    const predictedData = await DataManager.getInstance().getPredictedData()


    return {
      real: realData.map(data => ({
        time: data.time,
        bikes: data.bikes.filter(b => isNearBy({
          lat: Number(lat),
          lng: Number(lng)
        }, {
          lat: b.location.lat,
          lng: b.location.lng
        }))
      })),
      predicted: predictedData.map(data => ({
        time: data.time,
        bikes: data.bikes.filter(b => isNearBy({
          lat: Number(lat),
          lng: Number(lng)
        }, {
          lat: b.location.lat,
          lng: b.location.lng
        }))
      }))
    }
  }, {
    body: t.Object({
      lat: t.String(),
      lng: t.String()
    })
  })
  .listen(9902);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
