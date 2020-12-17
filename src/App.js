import React from 'react';
import './App.css';

const OPEN_WEATHER_MAP_API_KEY = "fae58d081df939c92e507d70ab7e8a90";
const OPEN_WEATHER_MAP_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?";

function App() {
    return (
        <div id="App">
            <CityInput />
            <CurrentConditions />
            <TemperatureGraph />
            <Forecast />
        </div>
    );
}
class CityInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apiResponse: undefined,
        };
    }

    cityChanged = (e) => {
        fetch(OPEN_WEATHER_MAP_WEATHER_URL + "q=" + encodeURIComponent(e.target.value) + "&appid=" + OPEN_WEATHER_MAP_API_KEY)
            .then(res => res.json())
            .then((data) => {
                this.setState({apiResponse: data});
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
                <p>11:27PM, Wed, Dec 16, 2020</p>
                <p>Cloudy, 25F</p>
                <p>84% humidity, 8mph wind speed</p>
            </div>
        );
    }
}

class TemperatureGraph extends React.Component {
    render() {
        return (
            <div id="TemperatureGraph">
                25F
            </div>
        );
    }
}

class Forecast extends React.Component {
    render() {
        return (
            <div id="Forecast">
                <p>Today, cloudy, 84% humidity</p>
                <p>Dec 17, cloudy, 85% humidity</p>
                <p>Dec 18, cloudy, 86% humidity</p>
                <p>Dec 19, cloudy, 87% humidity</p>
            </div>
        );
    }
}

export default App;
