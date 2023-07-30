function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function findClosestObject(latitude, longitude, data) {
    let closestObject = null;
    let minDistance = Infinity;

    data.forEach((item) => {
        const distance = calculateDistance(latitude, longitude, parseFloat(item.latitude), parseFloat(item.longitude));
        if (distance < minDistance) {
            minDistance = distance;
            closestObject = item;
        }
    });

    return closestObject;
}