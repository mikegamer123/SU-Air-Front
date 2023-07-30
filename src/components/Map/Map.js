import {MapContainer, Marker, Popup, Circle, TileLayer, ZoomControl} from 'react-leaflet'
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import stationIconPng from "src/resources/images/stationIcon.png"
import stationIconClosestPng from "src/resources/images/stationIconClosest.png"
import {qualityColorVals} from "@/config";
import { addressPoints } from "src/examplePoints"
import {Icon} from 'leaflet'
import {useRouter} from 'next/router';
import {useEffect, useState} from "react";
import {findClosestObject} from "@/findClosestHelper";

// const createRectangleAroundPoint = (center, width, height) => {
//     const halfWidth = width / 2;
//     const halfHeight = height / 2;
//
//     const topLeft = [center[0] - halfHeight, center[1] - halfWidth];
//     const bottomRight = [center[0] + halfHeight, center[1] + halfWidth];
//
//     return [topLeft, bottomRight];
// }; -- currently not needed

const Map = () => {
    const router = useRouter();
    const slug = router.query.slug;
    const districts = JSON.parse(localStorage.getItem("districts"));
    const sensors = JSON.parse(localStorage.getItem("sensors"));
    const matchedDistrict = districts.find(district => district.slug === slug);
    const user = JSON.parse(localStorage.getItem("user-loc")) || null;

    function getLowestKey(map, givenValue){
        let result = null;
        for (const [key, value] of map.entries()) {
            if (key < givenValue) {
                result = value;
                break;
            }
        }
        return result;
    }

    const center = addressPoints[0];
    // const rectangleBounds = createRectangleAroundPoint(center, 0.05, 0.025);

    //closest sensor to read off of, in this case to show on map as spec
    const closestSensor = findClosestObject(user ? user.latitude : matchedDistrict?.latitude || 0, user ? user.longitude : matchedDistrict?.longitude || 0, sensors);

    return (
        <MapContainer center={user ? [user.latitude, user.longitude] : [matchedDistrict?.latitude || 0, matchedDistrict?.longitude || 0]} zoom={15} zoomControl={false}  scrollWheelZoom={false} style={{height: 1000, width: "100%"}}>
            <ZoomControl position="bottomright" /> {/* Add a custom zoom control at the bottom left */}
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/*<Rectangle bounds={rectangleBounds} color="yellow" />*/}
            <Marker position={user ? [user.latitude, user.longitude] : [matchedDistrict?.latitude || 0, matchedDistrict?.longitude || 0]} icon={new Icon({iconUrl: markerIconPng.src, iconSize: [25, 41], iconAnchor: [12, 0]})}>
                <Popup>
                    Trenutna Lokacija. <br /> Pogledajte kvalitet vazduha.
                </Popup>
            </Marker>
            {sensors.map((item) => (
                <Marker key={item._id} position={[item.latitude, item.longitude]} icon={new Icon({iconUrl: closestSensor._id === item._id ? stationIconClosestPng.src : stationIconPng.src, iconSize: closestSensor._id === item._id ? [35,50] : [43, 40], iconAnchor: [20, 0]})}>
                    <Popup>Stanica:<b>{item.name}</b>
                        <br/>
                        {closestSensor._id === item._id ? "Podatci se čitaju sa ove stanice." : ""}
                    </Popup>
                </Marker>
            ))}
            {sensors.map((item) => (
                <Circle key={item._id} center={[item.latitude,item.longitude]} radius={1000} pathOptions={{
                    color: getLowestKey(qualityColorVals,item.particular_matter_25.aqi_us_ranking) || 'red', // Use item.color or fallback to 'red'
                    fillColor: getLowestKey(qualityColorVals,item.particular_matter_25.aqi_us_ranking) || '#f03', // Use item.fillColor or fallback to '#f03'
                    fillOpacity: item.fillOpacity || 0.5, // Use item.fillOpacity or fallback to 0.5
                }}>
                    <Popup>
                        Temperatura: {item.temperature}°C <br />
                        Pritisak: {item.air_pressure} Pa <br />
                        Vlažnost: {item.humidity}%
                    </Popup>
                </Circle>
            ))}
        </MapContainer>
    )
}

export default Map