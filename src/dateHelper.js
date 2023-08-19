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

export function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

export function getFirstDayOfNextMonth() {
    const currentDate = new Date();
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const year = nextMonthDate.getFullYear();
    const month = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
    const day = '01';
    return `${year}-${month}-${day}`;
}

export function getFirstDayOfPreviousTwoMonths() {
    const currentDate = new Date();
    const previousTwoMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
    const year = previousTwoMonthsDate.getFullYear();
    const month = String(previousTwoMonthsDate.getMonth() + 1).padStart(2, '0');
    const day = '01';
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