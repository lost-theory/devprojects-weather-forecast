import React from 'react';
import './App.css';

const OPEN_WEATHER_MAP_API_KEY = "fae58d081df939c92e507d70ab7e8a90";
const OPEN_WEATHER_MAP_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=" + OPEN_WEATHER_MAP_API_KEY + "&";
const OPEN_WEATHER_MAP_FORECAST_URL = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&appid=" + OPEN_WEATHER_MAP_API_KEY + "&";
const FORECAST_DAYS = 4;

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
            forecastData: {
                daily: undefined,
            },
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
        var forecastData = {};
        if(res.daily) {
            forecastData = {
                daily: res.daily,
            };
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
                <label htmlFor="city">Your city</label>
                <input name="city" id="city" onChange={this.cityChanged} />
            </div>
        );
    }
}

class CurrentConditions extends React.Component {
    render() {
        return (
            <div id="CurrentConditions">
                <p>{this.props.currentTime}</p>
                <p>{this.props.weatherData.condition || '--'}, {this.props.weatherData.temp || '--'}&deg;F</p>
                <p>{this.props.weatherData.humidity || '--'}% humidity, {this.props.weatherData.windSpeed || '--'}mph wind speed</p>
            </div>
        );
    }
}

class TemperatureGraph extends React.Component {
    render() {
        return (
            <div id="TemperatureGraph">
                {this.props.weatherData.temp || '--'}&deg;F
            </div>
        );
    }
}

class Forecast extends React.Component {
    render() {
        if(!this.props.forecastData.daily) {
            return <div id="Forecast"><p>--</p></div>;
        }
        var days = [];
        var day, temp, humid, condition;
        for(var i=0; i < FORECAST_DAYS; i++) {
            if(i === 0) {
                day = "Today";
            } else {
                day = new Date(this.props.forecastData.daily[i].dt * 1000).toDateString().split(' ');
                day = day[1] + " " + day[2];
            }
            temp = parseInt(this.props.forecastData.daily[i].temp.day);
            humid = this.props.forecastData.daily[i].humidity;
            condition = this.props.forecastData.daily[i].weather[0].main;
            days.push(<p key={day}>{day}, {condition}, {temp}&deg;F, Humidity {humid}%</p>);
        }
        return (
            <div id="Forecast">
                {days}
            </div>
        );
    }
}

export default App;
