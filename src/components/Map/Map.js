import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3/lib"
import { addressPoints } from "src/examplePoints"
import {Icon} from 'leaflet'

const Map = () => {


    return (
        <MapContainer center={[46.117592, 19.695603]} zoom={13} scrollWheelZoom={false} style={{height: 400, width: "100%"}}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatmapLayer
                fitBoundsOnLoad
                fitBoundsOnUpdate
                points={addressPoints}
                longitudeExtractor={m => m[1]}
                latitudeExtractor={m => m[0]}
                intensityExtractor={m => parseFloat(m[2])}
            />
            <Marker position={[46.117592, 19.695603]} icon={new Icon({iconUrl: markerIconPng.src, iconSize: [25, 41], iconAnchor: [12, 41]})}>
                <Popup>
                    Trenutna Lokacija. <br /> Pogledajte kvalitet vazduha.
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export default Map