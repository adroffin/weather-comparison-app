const form = document.getElementById("weatherForm");
const resultDiv = document.getElementById("weatherResult");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cityInput = document.getElementById("cityInput").value.trim();
  const cityNames = cityInput.split(",").map((city) => city.trim());
  resultDiv.innerHTML = "";

  if (cityNames.length === 0 || cityNames.some((city) => city === "")) {
    resultDiv.innerHTML =
      '<div class="alert alert-danger">Please enter valid city names!</div>';
    return;
  }

  try {
    const apiKey = "b185c652582c4b756b3fc8ddfc878bd7";
    const requests = cityNames.map((city) =>
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      ).then((response) => {
        if (!response.ok) throw new Error(`City ${city} not found.`);
        return response.json();
      })
    );

    const responses = await Promise.allSettled(requests);

    const validData = responses
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);
    const errors = responses
      .filter((res) => res.status === "rejected")
      .map((res) => res.reason.message);

    resultDiv.innerHTML = validData
      .map(
        (data) => `
      <div class="card result-card p-3 mb-3">
        <div class="card-body text-center">
          <h5 class="card-title">${data.name}, ${data.sys.country} <i class="fas fa-map-marker-alt text-info"></i></h5>
          <p class="mb-2"><i class="fas fa-temperature-high text-danger"></i> <strong>${data.main.temp}°C</strong></p>
          <p class="mb-2"><i class="fas fa-cloud text-primary"></i> ${data.weather[0].description}</p>
          <p class="mb-0"><i class="fas fa-tint text-info"></i> Humidity: ${data.main.humidity}%</p>
        </div>
      </div>
    `
      )
      .join("");

    if (errors.length > 0) {
      resultDiv.innerHTML += `<div class="alert alert-warning">${errors.join(
        "<br>"
      )}</div>`;
    }

    if (validData.length > 0) {
      const chartData = {
        labels: validData.map((data) => `${data.name}, ${data.sys.country}`),
        datasets: [
          {
            label: "Temperature (°C)",
            data: validData.map((data) => data.main.temp),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      };

      const chartContainer = document.createElement("div");
      chartContainer.classList.add("chart-container", "mt-3");
      const ctx = document.createElement("canvas");
      chartContainer.appendChild(ctx);
      resultDiv.appendChild(chartContainer);

      new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
});
