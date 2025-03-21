import React, { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import { getIp } from "./Vars";
import Badge from "react-bootstrap/Badge";
const GetFb = (props) => {
  const id = props.id;
  const type = props.type;
  const userData = sessionStorage.getItem("user");

  // Parse the stored data as JSON
  const parsedUserData = JSON.parse(userData);

  // Access the value of user_id
  const userId = parsedUserData.user_id;

  const [data, setData] = useState();
  const [flag, setFlag] = useState(0);
  const [fblinkid, setFblinkId] = useState();
  const [pending, setPending] = useState(true);

  //   const [nofb, setNofb] = useState(0);
  //   const [locked, setLocked] = useState(0);
  //   const [inactive, setInactive] = useState(0);
  //   const [profile, setProfile] = useState("No FB Profile");

  const handleDelete = (fbid) => {
    try {
      // Replace this URL with your server-side endpoint for handling file uploads
      fetch(getIp() + "/deleteFB?fbid=" + fbid + "&uid=" + userId, {
        method: "POST",
      });
      alert("FB Link removed.");
      window.location.reload();
    } catch (error) {
      console.error("Error while saving:", error);
    }
  };

  useEffect(() => {
    fetch(getIp() + "/getFb?id=" + id + "")
      .then((response) => response.json())
      .then((data) => setData(data), setPending(false))
      .catch((error) => console.error("Error on getdata: " + error));
  }, []);

  if (!data || (data.length === 0 && pending)) {
    return <Spinner animation="grow" size="sm" />;
  }

  if (type === "badge") {
    return data.map((item, index) => <i className="bi bi-facebook h6"></i>);
  }
  if (type === "link") {
    return data.map((item, index) => (
      <>
        <a
          href={item.facebook_id.replace(
            "fb://profile/",
            "https://www.facebook.com/profile/"
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.facebook_id != "" ? item.facebook_id : "FB link not found"}
          <span
            style={{ marginLeft: "10px", cursor: "pointer" }}
            onClick={() => handleDelete(item.id)}
          >
            <i className="bi bi-x text-muted"></i>
          </span>
        </a>

        {item.nofb === 1 && (
          <Badge bg="danger" style={{ marginRight: "10px" }}>
            no fb
          </Badge>
        )}
        {item.inactive == 1 && (
          <Badge bg="danger" style={{ marginRight: "10px" }}>
            inactive
          </Badge>
        )}
        {item.locked == 1 && (
          <Badge bg="danger" style={{ marginRight: "10px" }}>
            locked
          </Badge>
        )}
      </>
    ));
  }
  if (type === "hasfb") {
    return true;
  }
};

export default GetFb;
