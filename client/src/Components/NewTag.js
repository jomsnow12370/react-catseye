import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { getIp, getUserId } from "./Vars";
import FormControl from "react-bootstrap/FormControl";
import Badge from "react-bootstrap/Badge";
const NewTag = (props) => {
  const id = props.id;
  const [tags, setTags] = useState();
  const [searchTag, setSearchTag] = useState("");
  const userId = getUserId();

  const handleSearchTag = (e) => {
    try {
      setSearchTag(e.target.value);
      fetch(getIp() + "/searchTag?tag=" + searchTag + "")
        .then((response) => response.json())
        .then((data) => [setTags(data), console.log("test" + data)])
        .catch((error) => console.error("Error on getdata: " + error));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddtag = (remarks_id) => {
    // const id = req.query.id;
    // const tag = req.query.tag;
    // const uid = req.query.uid;
    fetch(
      getIp() +
        "/addTag?id=" +
        id +
        "&tag=" +
        remarks_id +
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
    <Row className="justify-content-center">
      <Col lg={12}>
        <span>
          <FormControl
            variant="dark"
            placeholder="New tag"
            value={searchTag}
            onChange={handleSearchTag}
          ></FormControl>
        </span>
        <Row>
          {tags &&
            searchTag != "" &&
            tags.map((item, key) => (
              <Col xl={12}>
                <Badge
                  bg="secondary"
                  style={{
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  className="mx-1 my-1"
                  data-toggle="tooltip"
                  title={item.remarks_txt}
                  onClick={() => handleAddtag(item.remarks_id)}
                >
                  <i className="bi bi-tag"></i> {item.shortcut_txt}
                </Badge>
              </Col>
            ))}
        </Row>
      </Col>
    </Row>
  );
};
export default NewTag;
