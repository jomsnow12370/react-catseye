import React, { useState } from "react";
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
import { getIp } from "./Vars";
import { useNavigate } from "react-router-dom";


const UserProfile = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    fname: "",
    mname: "",
    lname: "",
    profilePic: null,
  });

  const navigate = useNavigate();
  if (sessionStorage.length == 0) {
    navigate("/login");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleImageUpload = async (e) => {
    setUser({ ...user, profilePic: URL.createObjectURL(e.target.files[0]) });
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", e.target.files[0]);


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

  return (
    <Container className="poppins-regular">
      <Row className="justify-content-center mt-5">
        <Col lg={8}>
          <Card>
            <CardHeader>
              <CardTitle>
                <h4>User Profile</h4>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-5">
              <Form>
                <Row className="justify-content-center">
                  <Col lg={8} className="mb-5">
                    {user.profilePic && (
                      <Image
                        src={user.profilePic}
                        rounded
                        width={150}
                        height={150}
                      />
                    )}
                    <Form.Group className="mt-3">
                      <Form.Control type="file" onChange={handleImageUpload} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <Form.Group controlId="password">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="password">
                      <Form.Label>Confirm new Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group controlId="fname">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fname"
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="mname">
                      <Form.Label>Middle Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="mname"
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="lname">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lname"
                        onChange={handleChange}
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
