import React, { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import { getIp } from "./Vars";
import Badge from "react-bootstrap/Badge";
import { FormControl } from "react-bootstrap";
const GetTags = (props) => {
  const id = props.id;
  const [data, setData] = useState();

  const [pending, setPending] = useState(true);

  const userData = sessionStorage.getItem("user");

  // Parse the stored data as JSON
  const parsedUserData = JSON.parse(userData);

  // Access the value of user_id
  const userId = parsedUserData.user_id;

  useEffect(() => {
    fetch(getIp() + "/getTags?id=" + id + "")
      .then((response) => response.json())
      .then((data) => [setData(data), console.log(data), setPending(true)])
      .catch((error) => console.error("Error on getdata: " + error));
  }, []);

  const handleDelete = (remarksid, vid, remarks_txt) => {
    try {
      // Replace this URL with your server-side endpoint for handling file uploads
      fetch(
        getIp() +
          "/deleteTag?tagid=" +
          remarksid +
          "&uid=" +
          userId +
          "&vid=" +
          vid +
          "&txt=" +
          remarks_txt +
          "",
        {
          method: "POST",
        }
      );
      alert("Tag removed.");
      window.location.reload();
    } catch (error) {
      console.error("Error while saving:", error);
    }
  };

  if (!!data && !!pending) {
    return (
      <>
        <div style={{ display: "block" }}>
          {data.map((item, index) => {
            return (
              <>
                <Badge bg="secondary" style={{ marginRight: "10px" }}>
                  {item.remarks_txt}
                  <span
                    style={{
                      float: "right",
                      cursor: "pointer",
                      marginLeft: "2px",
                    }}
                    onClick={() =>
                      handleDelete(item.v_remarks_id, id, item.remarks_txt)
                    }
                  >
                    <i className="bi bi-x text-muted"></i>
                  </span>
                </Badge>
              </>
            );
          })}
        </div>

      </>
    );
  } else {
    <Spinner animation="grow" size="sm" />;
  }
};
export default GetTags;
