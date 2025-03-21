import React, { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { getIp } from "./Vars";

const Settings = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const [usersData, setUsersData] = useState([]);


  useEffect(() => {

  }, []);

  return (
    <>
      <h1>Settings</h1>
    </>
  );
};

export default Settings;
