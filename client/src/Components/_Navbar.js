import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button, Image } from "react-bootstrap";
import GetDQ from "./GetDq";
import { getIp, getUserId } from "./Vars";
import GetWardingDQ from "./getWardingDq";

const Nav = () => {
  const userData = sessionStorage.getItem("user");

  // Parse the stored data as JSON
  const parsedUserData = JSON.parse(userData);

  // Access the value of user_id
  const userId = parsedUserData.user_id;

  const [selectedFile, setSelectedFile] = useState(
    getIp() + `/userprofiles/k.jpg`
  ); // Initialize with null

  useEffect(() => {
    fetch(getIp() + "/getUserData?uid=" + userId)
      .then((response) => response.json())
      .then((data) => [
        setSelectedFile(getIp() + `/userprofiles/${data[0].imgname}`),
        console.log(data),
      ])
      .catch((error) => console.error("ERR: " + error));
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top poppins-regular">
      <div className="container-fluid"> 
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="/main">
                Search
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/wardinglogs">
                Warding Logs
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/leaderreport">
                Leader Report
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/householdreport">
                Household Report
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/warding">
                Household Warding
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/warding_old">
                Legacy Warding
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/wardinglist">
                Warding List(Household)
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/leaderwardinglist">
                Warding List(Legacy)
              </a>
            </li>
          </ul>
        </div>
        <div className="d-flex align-items-center">
          <GetWardingDQ id={userId} />
          
          <a
            className="text-reset me-3"
            href="/profile"
            data-toggle="tooltip"
            data-placement="bottom"
            title="Profile"
          >
            <Image
              src={selectedFile} // Use createObjectURL to preview the selected file
              roundedCircle
              width={18}
              height={18}
              style={{ marginTop: "-1px" }}
            />
          </a>
          <a
            className="text-reset me-3"
            href="/settings"
            data-toggle="tooltip"
            data-placement="bottom"
            title="Settings"
          >
            Settings
          </a>
          <a
            className="text-reset me-3"
            href="/"
            data-toggle="tooltip"
            data-placement="bottom"
            title="Logout"
          >
            Logout
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
