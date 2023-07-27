import {MapContainer, Marker, Popup, Rectangle, TileLayer, ZoomControl} from 'react-leaflet'
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { addressPoints } from "src/examplePoints"
import {Icon} from 'leaflet'
import {useRouter} from 'next/router';
import {useEffect, useState} from "react";

const createRectangleAroundPoint = (center, width, height) => {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const topLeft = [center[0] - halfHeight, center[1] - halfWidth];
    const bottomRight = [center[0] + halfHeight, center[1] + halfWidth];

    return [topLeft, bottomRight];
};

const Map = () => {
    const router = useRouter();
    const slug = router.query.slug;
    const districts = JSON.parse(localStorage.getItem("districts"));
    const matchedDistrict = districts.find(district => district.slug === slug);
    const user = JSON.parse(localStorage.getItem("user-loc")) || null;

    useEffect(() => {
        if (user) {
            localStorage.removeItem("user-loc");
        }
    }, []);

    const center = addressPoints[0];
    const rectangleBounds = createRectangleAroundPoint(center, 0.05, 0.025);

    return (
        <MapContainer center={user ? [user.latitude, user.longitude] : [matchedDistrict?.latitude || 0, matchedDistrict?.longitude || 0]} zoom={15} zoomControl={false}  scrollWheelZoom={false} style={{height: 1000, width: "100%"}}>
            <ZoomControl position="bottomright" /> {/* Add a custom zoom control at the bottom left */}
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Rectangle bounds={rectangleBounds} color="yellow" />
            <Marker position={user ? [user.latitude, user.longitude] : [matchedDistrict?.latitude || 0, matchedDistrict?.longitude || 0]} icon={new Icon({iconUrl: markerIconPng.src, iconSize: [25, 41], iconAnchor: [12, 41]})}>
                <Popup>
                    Trenutna Lokacija. <br /> Pogledajte kvalitet vazduha.
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export default Map