export function formatDateToSerbian(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
        locale: "sr-Latn-RS"
    };

    const formattedDate = new Intl.DateTimeFormat("sr-Latn-RS", options).format(date);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export function formatDateToSerbianWithHours(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
        locale: "sr-Latn-RS"
    };

    //const formattedDate = new Intl.DateTimeFormat("sr-Latn-RS", options).format(date);
    const formattedTime = date.toLocaleTimeString("sr-Latn-RS", { hour: "numeric", minute: "numeric", timeZone: "UTC" });

    //const formattedDateUpperCase = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    return `${formattedTime}`;
}

export function getCurrentDateFormatted (){
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getWeekBeforeCurrentDateFormatted () {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function convertTimestampToDate(isoDateString) {
    const dateObject = new Date(isoDateString);

    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
    const hours = String(dateObject.getHours()).padStart(2, '0');
    const minutes = String(dateObject.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}