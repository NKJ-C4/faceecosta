import React, { Component } from "react";
import Particles from "react-particles-js";
import Navigation from "./Components/Navigation/Navigation";
import ImageLinkForm from "./Components/ImageLinkForm/ImageLinkForm";
import Logo from "./Components/Logo/Logo";
import Rank from "./Components/Rank/Rank";
import SignIn from "./Components/SignIn/SignIn";
import Register from "./Components/Register/Register";
import Clarifai from 'clarifai';
import "./App.css";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Checking for git username change, this comment has no significance at all regarding the app
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

const initialState = {
  input: "",
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  componentDidMount() {
    fetch('http://localhost:3000/')
      .then(response => response.json())
      .then(data => console.log(data))
  }

  onButtonSubmit = () => {
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = '6b8400558e134bffb6eb548e1298ed9d';
    const USER_ID = 'bpw161z89otb';
    const APP_ID = 'visageer';
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
    const IMAGE_URL = this.state.input;

    this.setState({
      imageUrl: this.state.input
    })

    const raw = JSON.stringify({
          "user_app_id": {
              "user_id": USER_ID,
              "app_id": APP_ID
          },
          "inputs": [
              {
                  "data": {
                      "image": {
                          "url": IMAGE_URL
                      }
                  }
              }
          ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.json())
        .then(response => {
          if(response) {
            fetch('http://localhost:3000/image/', {
              method: "put",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
              .then(res => res.json())
              .then(count => {
                this.setState(Object.assign(this.state.user, {entries: count}))
              })
              .catch(err => toast.error("Something went wrong"))
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
          toast.success("Face detected!")
        })
        .catch(error => toast.error("Something went wrong"));
  }

  calculateFaceLocation = (data) =>{
    let clarifaiFace = data?.outputs[0]?.data?.regions[0]?.region_info?.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log("box is: ", box);
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
      this.setState({route: 'signin'})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
      this.setState({
        route: 'home'
      })
    } else {
      this.setState({
        route: route
      })
    }
  }
  render() {
    const { isSignedIn, imageUrl, route, box } = this.state; 
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
        {this.state.route === 'home' ?
           <>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries} />
          <ImageLinkForm
            onInputChange={this.onInputChange}
            onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
          </>
        : (
            this.state.route === 'signin' ?
              <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
            :
              <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
          )
        } 
        <ToastContainer />
      </div>
    );
  }
}

export default App;
