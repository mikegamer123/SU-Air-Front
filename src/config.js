import heavyRainIcon from "@/resources/images/heavyRain.png";
import rainIcon from "@/resources/images/rainy.png";
import sunnyIcon from "@/resources/images/sunny.png";
import foggyIcon from "@/resources/images/foggy.png";
import sunCloudIcon from "@/resources/images/cloudSunny.png";
import snowIcon from "@/resources/images/snow.png";
import cloudyIcon from "@/resources/images/cloud.png"
import cloudierIcon from "@/resources/images/cloudier.png"

export const BASE_URL = 'http://localhost:3001';
export const BASE_API_URL = 'https://suair.dev.studiopresent.cloud'; //'https://suair.onrender.com';
export const BASE_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=46.0970&longitude=19.667587&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode,winddirection_10m&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,weathercode,precipitation_probability_max&timezone=Europe%2FBerlin';
export const qualityText = new Map();
qualityText.set(301, 'Opasno');
qualityText.set(201, 'Vrlo Nezdravo');
qualityText.set(151, 'Nezdravo');
qualityText.set(101, 'Nezdravo za os. grupe');
qualityText.set(51, 'Umereno');
qualityText.set(0, 'Dobar');
export const qualityColor = new Map();
qualityColor.set(301, 'opasno');
qualityColor.set(201, 'vrloNezdravo');
qualityColor.set(151, 'nezdravo');
qualityColor.set(101, 'nezdravoOs');
qualityColor.set(51, 'umereno');
qualityColor.set(0, 'dobar');

export const qualityColorVals = new Map();
qualityColorVals.set(301, '#A06A7B');
qualityColorVals.set(201, '#A070B6');
qualityColorVals.set(151, '#F65E5F');
qualityColorVals.set(101, '#F99049');
qualityColorVals.set(51, '#FACF39');
qualityColorVals.set(0, '#9CD84E');

//weather descriptions
export const weatherMap = new Map([
    [0, 'Vedro nebo'],
    [1, 'Pretežno vedro'],
    [2, 'Delimično oblačno'],
    [3, 'Oblačno'],
    [45, 'Magla'],
    [48, 'Magla'],
    [51, 'Slaba kiša'],
    [53, 'Umerena kiša'],
    [55, 'Jaka kiša'],
    [56, 'Slaba ledena kiša'],
    [57, 'Jaka ledena kiša'],
    [61, 'Slab kišni pljusak'],
    [63, 'Umeren kišni pljusak'],
    [65, 'Jak kišni pljusak'],
    [66, 'Slab ledni pljusak'],
    [67, 'Jak ledni pljusak'],
    [71, 'Slab sneg'],
    [73, 'Umeren sneg'],
    [75, 'Jak sneg'],
    [77, 'Snežne pahulje'],
    [80, 'Slabi pljusak kiše'],
    [81, 'Umereni pljusak kiše'],
    [82, 'Jaki pljusak kiše'],
    [85, 'Slabi snežni pljusak'],
    [86, 'Jaki snežni pljusak'],
    [95, 'Nepogoda: Slaba ili umerena'],
    [96, 'Nepogoda sa slabim gradom'],
    [99, 'Nepogoda sa jakim gradom']
]);

//icons for weather
export const weatherIconMap =new Map([
    [0, sunnyIcon.src],
    [1, sunCloudIcon.src],
    [2, cloudyIcon.src],
    [3, cloudierIcon.src],
    [45, foggyIcon.src],
    [48, foggyIcon.src],
    [51, rainIcon.src],
    [53, rainIcon.src],
    [55, heavyRainIcon.src],
    [56, rainIcon.src],
    [57, heavyRainIcon.src],
    [61, rainIcon.src],
    [63, rainIcon.src],
    [65, heavyRainIcon.src],
    [66, snowIcon.src],
    [67, heavyRainIcon.src],
    [71, snowIcon.src],
    [73, snowIcon.src],
    [75, snowIcon.src],
    [77, snowIcon.src],
    [80, rainIcon.src],
    [81, rainIcon.src],
    [82, heavyRainIcon.src],
    [85, snowIcon.src],
    [86, snowIcon.src],
    [95, heavyRainIcon.src],
    [96, heavyRainIcon.src],
    [99, heavyRainIcon.src],
]);
