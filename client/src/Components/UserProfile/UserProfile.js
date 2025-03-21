import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Image,
  Row,
  Col,
  Container,
  CardBody,
  Card,
  CardHeader,
  CardTitle,
} from "react-bootstrap";
import { getIp, getUserId } from "../Vars";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const userId = getUserId();
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const [userData, setUserData] = useState([]);
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [selectedFile, setSelectedFile] = useState("logo512.png"); // Initialize with null

  useEffect(() => {
    fetch(getIp() + "/getUserData?uid=" + userId)
      .then((response) => response.json())
      .then((data) => [
        setFname(data[0].fname),
        setLname(data[0].lname),
        setPassword(data[0].password),
        setSelectedFile(getIp() + `/userprofiles/${data[0].imgname}`),
        console.log(data),
      ])
      .catch((error) => console.error("ERR: " + error));
  }, []);

  const handleFileChange = (e) => {
    // Set selected file
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please first select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    // formData.append("fname", fname);
    // formData.append("lname", lname);
    // formData.append("password", password);

    try {
      const response = await fetch(
        `${getIp()}/saveProfilepic?userid=${userId}&fname=${fname}&lname=${lname}&password=${password}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        alert("File upload is successful");
      } else {
        alert("Failed to upload the file due to errors");
      }
    } catch (error) {
      console.error("Error while uploading the file:", error);
      alert("An error occurred while uploading the file");
    }
  };

  return (
    <Container className="poppins-regular">
      <Row className="justify-content-center mt-5">
        <Col lg={6}>
          <Card>
            <CardHeader>
              <CardTitle>
                <h4>User Profile</h4>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-5">
              <Form onSubmit={handleSubmit}>
                <Row className="justify-content-center">
                  <Col lg={8} className="mb-5">
                    {selectedFile && (
                      <center>
                        <Image
                          src={selectedFile} // Use createObjectURL to preview the selected file
                          roundedCircle
                          width={150}
                          height={150}
                        />
                      </center>
                    )}
                    <Form.Group className="mt-3">
                      <Form.Control type="file" onChange={handleFileChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={12}>
                    <Form.Group controlId="password">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <Form.Group controlId="fname">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group controlId="lname">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  variant="secondary"
                  type="submit"
                  className="mt-3"
                  size="md"
                >
                  Submit
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
