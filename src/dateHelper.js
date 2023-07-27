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