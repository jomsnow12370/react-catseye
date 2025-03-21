import React, { useState, useEffect } from "react";
import GetType from "./GetLeaderType";
import { Badge } from "react-bootstrap";
import { getIp } from "./Vars";
const GetWarded = (props) => {
  const id = props.id;
  const [data, setData] = useState();

  useEffect(() => {
    fetch(getIp() + "/getWarded?id=" + id + "")
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
    <span className="text-muted">
      {data.map((item, key) => (
        <Badge className="m-1">
          <React.Fragment key={key}>
           <i className="bi bi-person-check"></i> {item.leader} {item.electionyear}{" "}
          </React.Fragment>
        </Badge>
      ))}
    </span>
  );
};
export default GetWarded;
