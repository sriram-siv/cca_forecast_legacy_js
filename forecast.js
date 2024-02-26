async function fetchData() {
  // Fetch data from url
  const url =
    "https://e75urw7oieiszbzws4gevjwvze0baaet.lambda-url.eu-west-2.on.aws/";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const weatherData = await response.json();

  return weatherData;
}

function isBetweenHours(min, max) {
  return (entry) => {
    const hour = new Date(entry.date_time).getHours();
    return min <= hour && hour < max;
  };
}

function getAverage(nums, unit = "") {
  if (!nums.length) return "Insufficient forecast data";

  const total = nums.reduce((acc, num) => acc + num);
  const average = (total / nums.length).toFixed(2);

  return `${average}${unit}`;
}

async function main(weatherData) {
  // Process data
  const groupedData = weatherData.reduce((acc, entry) => {
    const entryDate = new Date(entry.date_time);
    const dayKey = entryDate.toISOString().split("T")[0];
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(entry);
    return acc;
  }, {});

  const container = document.getElementById("forecast-summaries");
  Object.entries(groupedData).forEach(([day, entries]) => {
    const allTemps = entries.map((entry) => entry.average_temperature);
    const morningEntries = entries.filter(isBetweenHours(6, 12));
    const afternoonEntries = entries.filter(isBetweenHours(12, 18));

    const morningTemps = morningEntries.map(
      (entry) => entry.average_temperature
    );
    const morningRains = morningEntries.map(
      (entry) => entry.probability_of_rain
    );
    const afternoonTemps = afternoonEntries.map(
      (entry) => entry.average_temperature
    );
    const afternoonRains = afternoonEntries.map(
      (entry) => entry.probability_of_rain
    );

    const summaryElement = document.createElement("div");
    summaryElement.innerHTML = `
          <h3>Day: ${new Date(day).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}</h3>
          <p>Morning Average Temperature: ${getAverage(morningTemps)}</p>
          <p>Morning Chance Of Rain: ${getAverage(morningRains, "%")}</p>
          <p>Afternoon Average Temperature: ${getAverage(afternoonTemps)}</p>
          <p>Afternoon Chance Of Rain: ${getAverage(afternoonRains, "%")}</p>
          <p>High Temperature: ${Math.max(...allTemps)}</p>
          <p>Low Temperature: ${Math.min(...allTemps)}</p>
      `;
    container.appendChild(summaryElement);
  });
}

try {
  document.addEventListener("DOMContentLoaded", async () => {
    const weatherData = await fetchData();

    main(weatherData);
  });
} catch (error) {
  console.error("Failed to fetch weather data:", error);
}
