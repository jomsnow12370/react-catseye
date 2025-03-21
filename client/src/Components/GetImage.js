import React, { useState, useEffect } from "react";
import { getIp } from "./Vars";
const VoterImage = (props) => {
  const id = props.id;
  const width = props.picwidth;
  const height = props.picheight;
  const [imgName, setImageName] = useState("logo512.png");
  const [isReact, setIsReact] = useState(false);

  useEffect(() => {
    fetch(getIp()+"/getImg?id=" + id + "")
      .then((response) => response.json())
      .then((data) => [setImageName(data.imgname), setIsReact(data.type), console.log(data)])
      .catch((error) => console.error("No image found"));
  }, []);

  return (
    <>
      {isReact && (
        <img
          className="rounded-circle"
          src={getIp()+`/profiles/${id}/${imgName}`}
          width={width}
          height={height}
          alt={imgName}
        ></img>
      )}
       {!isReact && (
        <img
          className="rounded-circle"
          src={getIp()+`/profiles/${imgName}`}
          width={width}
          height={height}
          alt={imgName}
        ></img>
      )}
      
    </>
  );
};

export default VoterImage;
