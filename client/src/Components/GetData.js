import React, { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import { getIp } from "./Vars";
const GetData = (props) => {
  const id = props.id;
  const type = props.type;
  const [data, setData] = useState();
  const [pending, setPending] = useState(true);

  useEffect(() => {
    fetch(getIp()+"/getData?id=" + id + "")
      .then((response) => response.json())
      .then((data) => [setData(data), console.log(data), setPending(false)])
      .catch((error) => console.error("Error on getdata: " + error));
  }, []);
  if (pending) {
    return <Spinner animation="grow" size="sm" />;
  } else {
    if (type === "name") {
      if (data[0].record_type === "NICL") {
        return (
          <span className="text-danger text-decoration-line-through">
            {data[0].fullname}
          </span>
        );
      } else {
        return data[0].fullname;
      }
    }
    if (type === "namesecond") {
      return data[0].fullname2;
    }
    if (type === "address") {
      return data[0].address;
    }
    if (type === "bday") {
      return data[0].v_birthday;
    }
    if (type === "rtype") {
      return data[0].record_type;
    }
    if (type === "age") {
      return data[0].age;
    }
    if (type === "precinct") {
      return data[0].v_precinct_no;
    } else {
      return console.log("error on getting data. no type detected");
    }
  }
};
export default GetData;
