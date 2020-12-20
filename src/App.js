import React from 'react';
import { Line } from 'react-chartjs-2';
import './App.css';

const OPEN_WEATHER_MAP_API_KEY = "fae58d081df939c92e507d70ab7e8a90";
const OPEN_WEATHER_MAP_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=" + OPEN_WEATHER_MAP_API_KEY + "&";
const OPEN_WEATHER_MAP_FORECAST_URL = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&appid=" + OPEN_WEATHER_MAP_API_KEY + "&";
const FORECAST_DAYS = 4;

const WEATHER_CONDITION_TO_EMOJI = {
    "Snow": "❄️",
    "Clouds": "☁️",
    "Thunderstorm": "⛈️",
    "Drizzle": "🌧️",
    "Rain": "🌧️",
    "Mist": "🌫️",
    "Haze": "🌫️",
    "Fog": "🌫️",
    "Dust": "🌫️",
    "Sand": "🌫️",
    "Smoke": "🔥",
    "Ash": "🌋",
    "Squall": "💨",
    "Tornado": "🌪️",
    "Clear": "☀️",
    "Meteor Strike Imminent": "☄️",
};

function App() {
    return <WeatherForecastApp />;
}

class WeatherForecastApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            weatherData: {
                temp: undefined,
                condition: undefined,
                windSpeed: undefined,
                humidity: undefined,
            },
            forecastData: [],
        };
    }

    currentTime() {
        var d = new Date();
        var time = d.toLocaleTimeString();
        time = time.replace(/(\d+):(\d+):(\d+)/, "$1:$2");
        var day = d.toDateString();
        return time + ", " + day;
    }

    handleWeatherApiResponse = (res) => {
        var weatherData = {};
        if(res.main) {
            weatherData = {
                temp: parseInt(res.main.temp),
                condition: res.weather[0].main,
                windSpeed: parseInt(res.wind.speed),
                humidity: res.main.humidity,
            };
        }
        this.setState({weatherData: weatherData});
    }

    handleForecastApiResponse = (res) => {
        var forecastData = [];
        if(res.daily) {
            var day, temp, humid, condition;
            for(var i=0; i < FORECAST_DAYS; i++) {
                if(i === 0) {
                    day = "Today";
                } else {
                    day = new Date(res.daily[i].dt * 1000).toDateString().split(' ');
                    day = day[1] + " " + day[2];
                }
                temp = parseInt(res.daily[i].temp.day);
                humid = res.daily[i].humidity;
                condition = res.daily[i].weather[0].main;
                forecastData.push({day: day, temp: temp, humid: humid, condition: condition});
            }
        }
        this.setState({forecastData: forecastData});
    }

    render() {
        return (
            <div id="App">
                <CityInput
                    handleWeatherApiResponse={this.handleWeatherApiResponse}
                    handleForecastApiResponse={this.handleForecastApiResponse}
                />
                <CurrentConditions
                    currentTime={this.currentTime()}
                    weatherData={this.state.weatherData}
                />
                <TemperatureGraph
                    weatherData={this.state.weatherData}
                    forecastData={this.state.forecastData}
                />
                <Forecast
                    forecastData={this.state.forecastData}
                />
            </div>
        );
    }
}

class CityInput extends React.Component {
    cityChanged = (e) => {
        fetch(OPEN_WEATHER_MAP_WEATHER_URL + "q=" + encodeURIComponent(e.target.value))
            .then(res => res.json())
            .then((data) => {
                this.props.handleWeatherApiResponse(data);
                if(!data.coord) {
                    return;
                }
                fetch(OPEN_WEATHER_MAP_FORECAST_URL + "lat=" + encodeURIComponent(data.coord.lat) + "&lon=" + encodeURIComponent(data.coord.lon))
                    .then(res => res.json())
                    .then((data) => {
                        this.props.handleForecastApiResponse(data);
                    });
            });
    }

    render() {
        return (
            <div id="CityInput">
                <label htmlFor="city">City</label>
                <input name="city" id="city" onChange={this.cityChanged} />
            </div>
        );
    }
}

class CurrentConditions extends React.Component {
    render() {
        var conditionIcon = WEATHER_CONDITION_TO_EMOJI[this.props.weatherData.condition] || "🤔";
        return (
            <div id="CurrentConditions">
                <p className="time">{this.props.currentTime}</p>
                <p className="condIcon">{conditionIcon || '--'}</p>
                <p className="condTitle">{this.props.weatherData.condition || '--'}</p>
                <p className="temp">{this.props.weatherData.temp || '--'}&deg;F</p>
                <p className="humid">{this.props.weatherData.humidity || '--'}% humidity, {this.props.weatherData.windSpeed || '--'}mph wind speed</p>
            </div>
        );
    }
}

class TemperatureGraph extends React.Component {
    render() {
        var labels = [];
        this.props.forecastData.forEach((x) => { labels.push(x.day); });
        var points = [];
        this.props.forecastData.forEach((x) => { points.push(x.temp); });
        const data = {
            labels: labels,
            datasets: [{label: "Temperature", data: points, fill: false, borderColor: "rgb(75, 192, 192)", lineTension: 0.5}]
        };
        const options = {
            legend: {display: false},
            scales: {yAxes: [{offset: true}], xAxes: [{display: false}]},
        };
        return (
            <div id="TemperatureGraph">
                <div className="graphContainer">
                    <Line data={data} options={options} />
                </div>
            </div>
        );
    }
}

class Forecast extends React.Component {
    render() {
        var data = this.props.forecastData;
        var days = [];
        var conditionIcon;
        for(var i=0; i < FORECAST_DAYS; i++) {
            if(!data[i]) {
                days.push(<div className="day" key={i}>
                    <p className="dayName">--</p>
                </div>);
                continue;
            }
            conditionIcon = WEATHER_CONDITION_TO_EMOJI[data[i].condition] || "🤔";
            days.push(<div className={"day " + (data[i].day === 'Today' ? 'today' : '')} key={data[i].day}>
                <p className="dayName">{data[i].day}</p>
                <p className="condIcon">{conditionIcon}</p>
                <p className="condTitle">{data[i].condition}</p>
                <p className="temp">{data[i].temp}&deg;F</p>
                <p className="humidTitle">Humidity</p>
                <p className="humid">{data[i].humid}%</p>
            </div>);
        }
        return (
            <div id="Forecast">
                {days}
            </div>
        );
    }
}

export default App;
