import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { getIp } from "./Vars";
const AddTag = (props) => {
  const id = props.id;
  const [tags, setTags] = useState([]);

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  useEffect(() => {
    fetch(getIp() + "/getCustomTags")
      .then((response) => response.json())
      .then((data) => [setTags(data), console.log(data)])
      .catch((error) => console.error("ERR: " + error));
  }, []);

  const handleSelectChange = (event) => {
    // const id = req.query.id;
    // const tag = req.query.tag;
    // const uid = req.query.uid;
    fetch(
      getIp() +
        "/addTag?id=" +
        id +
        "&tag=" +
        event.target.value +
        "&uid=" +
        userId +
        "",
      {
        method: "POST",
      }
    );
    alert("Tag added..");
  };
  return (
    <span>
      <Form>
        <Form.Select
          size="sm"
          aria-label="Default select example"
          // Set the value of the select input to the current uploadType state
          onChange={handleSelectChange} // Call handleSelectChange function on change
        >
          <option>Select a tag to add...</option>
          {tags &&
            tags.map((item, index) => (
              <option
                value={item.remarks_id}
                data-toggle="tooltip"
                title={item.shortcut_txt}
              >
                {item.remarks_txt}
              </option>
            ))}
        </Form.Select>
      </Form>
    </span>
  );
};
export default AddTag;
