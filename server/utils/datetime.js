/**
 * DateTime Utility Functions
 * Provides Malaysian timezone (GMT+8) formatted timestamps
 */

/**
 * Get current timestamp in Malaysian timezone (Asia/Kuala_Lumpur)
 * @returns {string} ISO 8601 formatted timestamp in Malaysia timezone
 */
const getMalaysianTimestamp = () => {
  return new Date()
    .toLocaleString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(
      /(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2}):(\d{2})/,
      "$3-$2-$1T$4:$5:$6+08:00"
    );
};

/**
 * Get ISO string in Malaysian timezone
 * @returns {string} ISO 8601 string with +08:00 offset
 */
const toMalaysianISO = () => {
  const date = new Date();
  const malaysianDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
    })
  );

  const year = malaysianDate.getFullYear();
  const month = String(malaysianDate.getMonth() + 1).padStart(2, "0");
  const day = String(malaysianDate.getDate()).padStart(2, "0");
  const hours = String(malaysianDate.getHours()).padStart(2, "0");
  const minutes = String(malaysianDate.getMinutes()).padStart(2, "0");
  const seconds = String(malaysianDate.getSeconds()).padStart(2, "0");
  const ms = String(malaysianDate.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}+08:00`;
};

module.exports = {
  getMalaysianTimestamp,
  toMalaysianISO,
};
