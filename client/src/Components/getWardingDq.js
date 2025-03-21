import React, { useState, useEffect } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import { Row, Col, Button, Form, FormGroup, Badge } from "react-bootstrap";
import { getIp } from "./Vars";
const GetWardingDQ = (props) => {
  const [dailyQuota, setdailyQuota] = useState(0); //nodata;
  const [classess, setClassess] = useState("primary");

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  useEffect(() => {
    fetch(getIp() + "/getWardingDq?uid=" + userId)
      .then((response) => response.json())
      .then((data) => [setdailyQuota(data[0].cnt), console.log(JSON.stringify(data))])
      .catch((error) => console.error("ERR: " + error));

    // if (dailyQuota <= 200 && dailyQuota >= 150) {
    //   setClassess("success");
    // }
    // if (dailyQuota <= 149 && dailyQuota >= 80) {
    //   setClassess("info");
    // }
    // if (dailyQuota <= 79 && dailyQuota >= 50) {
    //   setClassess("primary");
    // }
    // if (dailyQuota <= 49 && dailyQuota >= 30) {
    //   setClassess("warning");
    // }

    // if (dailyQuota <= 29) {
    //   setClassess("danger");
    // }

  });

  return (
    <Badge bg={classess} style={{ marginRight: "10px" }} data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Daily fota">
      {dailyQuota} {dailyQuota >= 200 && <i className="bi bi-check"></i>}
    </Badge>
  );
};
export default GetWardingDQ;
