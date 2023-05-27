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
    this.setState({
      imageUrl: this.state.input
    })

    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        input: this.state.input
      })
    })
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
