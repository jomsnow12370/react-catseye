import React, { useState, useEffect } from "react";
import GetType from "./GetLeaderType";
import { getIp } from "./Vars";
const GetLeader = (props) => {
  const id = props.id;
  const [data, setData] = useState();

  useEffect(() => {
    fetch(getIp() + "/getLeader?id=" + id + "")
      .then((response) => response.json())
      .then((data) => [setData(data), console.log(data)])
      .catch((error) => console.error("Error on getdata: " + error));
  }, []);

  // If data is empty, return null
  if (!data || data.length === 0) {
    return null;
  }

  // If data is available, render it
  return (
    <>
      {data.map((item, key) => (
        <span>
          <h5 style={{fontSize: "small"}}>
            <React.Fragment key={key}>
              {GetType(item.type)} {item.electionyear}{" "} 
            </React.Fragment>
          </h5>
        </span>
      ))}
    </>
  );
};
export default GetLeader;
