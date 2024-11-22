import {Elysia, t} from "elysia";
import {TokenManager} from "./token-manager";
import {DataManager} from "./data-manager";

TokenManager.getInstance()

const app = new Elysia()
  .get('/', async ({params: {lat, lng}}) => {
    const realData = await DataManager.getInstance().getRealData()
    const predictedData = await DataManager.getInstance().getPredictedData()

    const isWithinRange = (lat1: number, lng1: number, lat2: number, lng2: number): boolean => {
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371e3; // Earth radius in meters
      const lat1_rad = toRad(lat1);
      const lat2_rad = toRad(lat2);
      const lat_delta = toRad(lat2 - lat1_rad);
      const lng_delta = toRad(lng2 - lng1);

      const a =
        Math.sin(lat_delta / 2) * Math.sin(lat_delta / 2) +
        Math.cos(lat1_rad) * Math.cos(lat2_rad) *
        Math.sin(lng_delta / 2) * Math.sin(lng_delta / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c; // in meters

      return distance <= 500; // within 500 meters
    };


    return {
      real: realData.map(data => ({
        time: data.time,
        bikes: data.bikes.filter(b => isWithinRange(lat, lng, b.location.lat, b.location.lng))
      })),
      predicted: predictedData.map(data => ({
        time: data.time,
        bikes: data.bikes.filter(b => isWithinRange(lat, lng, b.location.lat, b.location.lng))
      }))
    }
  }, {
    params: t.Object({
      lat: t.Number(),
      lng: t.Number()
    })
  })
  .listen(9902);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
