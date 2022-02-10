import React from "react";

const FaceRecognition = ({ imageUrl }) => {
  return(
    <div className="center ma">
      <div className="absolute mt2">
      <img id="inputimage" src={imageUrl} alt="returned_image" width='500' height='auto'/>
      </div>
    </div>
  )
}

export default FaceRecognition;