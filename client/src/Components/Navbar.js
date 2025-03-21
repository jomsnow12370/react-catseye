import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button, Image, NavDropdown } from "react-bootstrap"; // Import NavDropdown
import GetDQ from "./GetDq";
import { getIp, getUserId } from "./Vars";
import GetWardingDQ from "./getWardingDq";

const Nav = () => {
  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  const [selectedFile, setSelectedFile] = useState(getIp() + `/userprofiles/k.jpg`);

  useEffect(() => {
    fetch(getIp() + "/getUserData?uid=" + userId)
      .then((response) => response.json())
      .then((data) => setSelectedFile(getIp() + `/userprofiles/${data[0].imgname}`))
      .catch((error) => console.error("ERR: " + error));
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top poppins-regular">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="/main">
                Search
              </a>
            </li>

            {/* Dropdown Navigation */}
            <NavDropdown title="Reports" id="basic-nav-dropdown">
              <NavDropdown.Item href="/wardinglogs">Warding Logs</NavDropdown.Item>
              <NavDropdown.Item href="/leaderreport">Leader Report</NavDropdown.Item>
              <NavDropdown.Item href="/householdreport">Household Report</NavDropdown.Item>
              <NavDropdown.Item href="/wardingreport">Warding Report</NavDropdown.Item>
              <NavDropdown.Item href="/liquidationreport">Liquidation Report</NavDropdown.Item>
              <NavDropdown.Item href="/liquidationincreport">Liquidation INC Report</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Warding" id="warding-dropdown">
              <NavDropdown.Item href="/warding">Household Warding</NavDropdown.Item>
              <NavDropdown.Item href="/warding_old">Legacy Warding</NavDropdown.Item>
              <NavDropdown.Item href="/wardinglist">Warding List (Household)</NavDropdown.Item>
              <NavDropdown.Item href="/leaderwardinglist">Warding List (Legacy)</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Registration" id="registration-dropdown">
              <NavDropdown.Item href="/registration">Leader Registration</NavDropdown.Item>
              <NavDropdown.Item href="/incregistration">INC Registration</NavDropdown.Item>
            </NavDropdown>
          </ul>
        </div>
        <div className="d-flex align-items-center">
          <GetWardingDQ id={userId} />

          <a className="text-reset me-3" href="/profile" title="Profile">
            <Image src={selectedFile} roundedCircle width={18} height={18} />
          </a>
          <a className="text-reset me-3" href="/settings" title="Settings">
            Settings
          </a>
          <a className="text-reset me-3" href="/" title="Logout">
            Logout
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Nav;