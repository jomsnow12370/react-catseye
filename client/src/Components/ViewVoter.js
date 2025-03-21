import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button, Card, CardBody } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import NewType from "./GetLeaderType";
import GetImage from "./GetImage";
import InputGroup from "react-bootstrap/InputGroup";
import { useNavigate } from "react-router-dom";

import { FormControl } from "react-bootstrap";

import "../App.css";


import AddTag from "./AddTag";

import VoterImage from "./GetImage";
import GetData from "./GetData";
import GetFb from "./GetFb";
import GetUploads from "./VoterUploads";
import NewTag from "./NewTag";
import FBInputs from "./FacebookInputs";
import GetLeader from "./GetLeader";
import GetWarded from "./GetWarded";
import GetTags from "./GetTags";

import { getIp } from "./Vars";
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



  const [fblink, setFblink] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("1");

  const handleSelectChange = (event) => {
    console.log(event.target.value);
    setUploadType(event.target.value); // Set the uploadType state to the selected value
  };

  useEffect(() => {
    fetch(getIp() + "/getData?id=" + id + "")
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
          getIp() +
            "/savePic?id=" +
            id +
            "&userid=" +
            userId +
            "&type=" +
            uploadType +
            "",
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <>
      <Container className="py-5 poppins-regular">
        {/* <h1>{userId}</h1> */}
        {vData && (
          <Row className="justify-content-center">
            <Col lg={12}>
              <Row>
                <Col lg={8}>
                  <Card style={{ padding: "35px" }}>
                    <CardBody>
                      <Row>
                        <Col lg={8}>
                          <h2 className="poppins-bold">
                            <GetData id={id} type="name" />{" "}
                            <GetFb id={id} type="badge" />
                          </h2>
                          <GetData id={id} type="address" />
                          <GetData type="precinct" id={id} />{" "}
                          <small>
                            [<GetData id={id} type="namesecond" />]
                          </small>
                          <div className="details">
                            <GetData type="bday" id={id} />{" "}
                            <strong>
                              <GetData type="age" id={id} />
                            </strong>
                            <br />
                            <GetLeader id={id} />
                          </div>
                          <GetFb id={id} type="link" />
                        </Col>
                        <Col lg={4}>
                          <div style={{ padding: "15px" }}>
                            <VoterImage
                              id={id}
                              picwidth={150}
                              picheight={150}
                            />
                          </div>
                        </Col>
                        <Col lg={12}>
                          <div className="text-muted remarks poppins-light mt-3">
                            <GetWarded id={id} className="text-muted" />
                            <GetTags id={id} />
                            <NewTag id={id}/>
                          </div>
                        </Col>
                      </Row>
                      <GetUploads id={id} picwidth={150} picheight={150} />
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4}>
                  <Card>
                    <CardBody>
                      <h5>Profile</h5>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group
                          controlId="formFileSm"
                          className="mb-3 mt-3"
                        >
                          <Form.Control
                            type="file"
                            onChange={handleFileChange}
                          />
                        </Form.Group>
                        <InputGroup className="mb-3">
                          <Form.Select
                            aria-label="Default select example"
                            className="mb-3"
                            value={uploadType} // Set the value of the select input to the current uploadType state
                            onChange={handleSelectChange} // Call handleSelectChange function on change
                          >
                            <option value="1">Profile</option>
                            <option value="2">Media Files</option>
                          </Form.Select>

                          <Button
                            variant="outline-secondary"
                            className="mb-3"
                            type="submit"
                          >
                            <i className="bi bi-upload"></i>
                          </Button>
                        </InputGroup>
                      </Form>
                
                      <FBInputs id={id} />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default ViewVoter;
