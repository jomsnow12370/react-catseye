import React, { useState, useEffect } from "react";
import { getIp } from "./Vars";
const GetUser = (props) => {
  const [data, setData] = useState();

  useEffect(() => {
    fetch(getIp()+"/user")
      .then((response) => response.json())
      .then((data) => [console.log(data), setData(data)])
      .catch((error) => console.error("Error on get user: " + error));
  }, []);
  if (!!data) {
    return data;
  }
};

export default GetUser;
