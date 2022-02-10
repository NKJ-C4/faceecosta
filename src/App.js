import React, { Component } from "react";
import Particles from "react-particles-js";
import Navigation from "./Components/Navigation/Navigation";
import ImageLinkForm from "./Components/ImageLinkForm/ImageLinkForm";
import Logo from "./Components/Logo/Logo";
import Rank from "./Components/Rank/Rank";
import Clarifai from 'clarifai';
import "./App.css";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";

const app = new Clarifai.App({
  apiKey: '5b468b2d8f3e43219fd0a98f63bbd9b4'
})

const particlesOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable: true,
        value_area: 1000,
      },
    },
  },
};
class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: '',
      box: {},
    };
  }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
  }

  onInputChange = (event) => {
    // console.log(event.target.value);
    this.setState({input: event.target.value})
  };

  onButtonSubmit = () => {
    this.setState({
      imageUrl: this.state.input,
    })
    // console.log("click");
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input
      )
      .then(response => this.calculateFaceLocation(response)
      .catch(err => console.log(err))
      )
  };
  render() {
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation />
        <Logo />
        <Rank />
        <ImageLinkForm
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition imageUrl={this.state.imageUrl}/>
      </div>
    );
  }
}

export default App;
