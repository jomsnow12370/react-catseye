import React, { useState, useEffect } from "react";
import { getIp } from "./Vars";

const GetUploads = (props) => {
  const id = props.id;
  const [uploadsArray, setUploadsArray] = useState([]);
  const [showDiv, setShowDiv] = useState(false);
  const width = props.picwidth;
  const height = props.picheight;

  useEffect(() => {
    fetch(getIp()+"/getUploads?id=" + id + "")
      .then((response) => response.json())
      .then((data) => [setUploadsArray(data), console.log(data)])
      .catch((error) => console.error("No image found"));
  }, []);

  const toggleDiv = () => {
    setShowDiv(!showDiv);
  };

  return (
    <>
      <button onClick={toggleDiv} className="btn btn-primary mt-3"><i className="bi bi-folder"></i> Uploads</button>
      {showDiv && (
        <div className="card mt-3 ">
          <div className="card-body">
            {uploadsArray.map((item, index) => (
              <img
                key={index}
                className="img-responsive p-3"
                src={
                  !item.type || item.type === null
                    ? getIp() +`/profiles/${item.imgname}`
                    : getIp() +`/profiles/${id}/${item.imgname}`
                }
                width={width}
                height={height}
                alt={item.imgname + " " + item.type}
              ></img>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default GetUploads;
