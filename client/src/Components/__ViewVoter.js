import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import NewType from "./GetLeaderType";
import GetImage from "./GetImage";
import InputGroup from "react-bootstrap/InputGroup";
import { useNavigate } from "react-router-dom";
import GetTags from "./GetTags";

import "../App.css";
import VoterImage from "./GetImage";
import GetData from "./GetData";
import GetFb from "./GetFb";
import GetUploads from "./VoterUploads";

import AddTag from "./AddTag";

const ViewVoter = () => {
  const navigate = useNavigate();
  if (sessionStorage.length == 0) {
    navigate("/login");
  }
  const userData = sessionStorage.getItem("user");

  // Parse the stored data as JSON
  const parsedUserData = JSON.parse(userData);

  // Access the value of user_id
  const userId = parsedUserData.user_id;

  const queryParameters = new URLSearchParams(window.location.search);
  const id = queryParameters.get("id");

  const [vData, setvData] = useState();

  const [selectedFile, setSelectedFile] = useState(null);

  const [fblink, setFblink] = useState("");

  const [uploadType, setUploadType] = useState("1");

  const handleSelectChange = (event) => {
    console.log(event.target.value);
    setUploadType(event.target.value); // Set the uploadType state to the selected value
  };

  useEffect(() => {
    fetch("http://192.168.10.215:3002/getData?id=" + id + "")
      .then((response) => response.json())
      .then((data) => [setvData(data), console.log(data)])
      .catch((error) => console.error("ERR: " + error));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please first select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Replace this URL with your server-side endpoint for handling file uploads
      const response = await fetch(
        "http://192.168.10.215:3002/savePic?id=" + id + "&userid=" + userId + "&type=" + uploadType + "",
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        alert("File upload is successfull");
        window.location.reload();
      } else {
        alert("Failed to upload the file due to errors");
      }
    } catch (error) {
      console.error("Error while uploading the file:", error);
      alert("Error occurred while uploading the file");
    }
  };

  const handleSubmitFacebook = (event) => {
    event.preventDefault();
    try {
      // Replace this URL with your server-side endpoint for handling file uploads
      fetch(
        "http://192.168.10.215:3002/saveFB?id=" +
        id +
        "&fblink=" +
        fblink +
        "&uid=" +
        userId +
        "",
        {
          method: "POST",
        }
      );
      alert("FB Link saved.");
    } catch (error) {
      console.error("Error while saving:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <>
      <Container className="py-5 poppins-regular mt-5 ">
        {/* <h1>{userId}</h1> */}
        {vData && (
          <Row className="justify-content-center">
            <Col lg={4}>
              <Form onSubmit={handleSubmit}>
                <center>
                  <VoterImage id={id} picwidth={150} picheight={150} />
                </center>
                <Form.Group controlId="formFileSm" className="mb-3 mt-3">
                  <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                <Form.Select
                  aria-label="Default select example"
                  className="mb-3"
                  value={uploadType} // Set the value of the select input to the current uploadType state
                  onChange={handleSelectChange} // Call handleSelectChange function on change
                >
                  <option value="1">Profile</option>
                  <option value="2">Media Files</option>
                </Form.Select>

                <Button className="btn-dark" type="submit">
                  <i className="bi bi-upload"></i> Upload
                </Button>
              </Form>

            </Col>
            <Col lg={8}>
              <h1 className="poppins-bold">
                <GetData id={id} type="name" /> <GetFb id={id} type="badge" />

              </h1>

              <GetData id={id} type="address" />
              <GetData type="precinct" id={id} />  <small>[<GetData id={id} type="namesecond" />]</small>
              <hr />
              <GetFb id={id} type="link" />

              <br />
              <span className="text-muted remarks poppins-light">
                <GetTags id={id} />
              </span>
              <Row className="mt-3 mb-3">
                <Col>
                  <InputGroup>
                    <Form.Control
                      placeholder="LINK/NO FB/INACTIVE/LOCKED"
                      aria-label="LINK/NO FB/INACTIVE/LOCKED"
                      aria-describedby="basic-addon2"
                      value={fblink}
                      onChange={(e) => setFblink(e.target.value)}
                    />
                    <Button
                      variant="outline-secondary"
                      id="button-addon2"
                      type="submit"
                      onClick={handleSubmitFacebook}
                    >
                      <i className="bi bi-save"></i>
                    </Button>
                  </InputGroup>
                </Col>
                <Col>
                  <AddTag id={id} />
                </Col>
              </Row>
              <GetUploads id={id} picwidth={150} picheight={150} />
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default ViewVoter;
