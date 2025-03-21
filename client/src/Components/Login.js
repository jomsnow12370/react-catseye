import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { Modal, Button, Container, Row, Col, Card } from "react-bootstrap";
import { getIp, fetchAndStoreIp } from "./Vars";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasRefreshed, setHasRefreshed] = useState(false);

  // Auto-refresh logic that runs once when component mounts
  useEffect(() => {
    const performInitialSetup = async () => {
      // Check if this is the first load (not a refresh)
      const refreshFlag = sessionStorage.getItem("hasRefreshed");
      
      if (!refreshFlag) {
        // Store flag to prevent additional refreshes
        sessionStorage.setItem("hasRefreshed", "true");
        
        // Ensure IP is fetched and stored before refresh
        await fetchAndStoreIp();
        
        // Trigger a single refresh
        window.location.reload();
      } else {
        // Mark that we've already refreshed to prevent further refreshes
        setHasRefreshed(true);
      }
    };

    performInitialSetup();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // Clear previous error messages

    try {
      const response = await fetch(
        `${getIp()}/login?userName=${userName}&password=${password}`
      );
      const data = await response.json();

      if (data && data.user_id) {
        sessionStorage.setItem("user", JSON.stringify(data));
        setShowModal(true); // Show success modal
      } else {
        setErrorMessage("Invalid username or password. Please try again.");
      }
    } catch (error) {
      console.error("Error on handleLogin:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  const handleNavigation = (path) => {
    setShowModal(false);
    navigate(path);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg">
        <h3 className="text-center mb-4">Login to Access</h3>
        {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </Card>

      {/* Success Modal After Login */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose Destination</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">Where would you like to go?</p>
          <Button variant="success" className="w-100 mb-2" onClick={() => handleNavigation("/registration")}>
            Go to Leader Registration
          </Button>
          <Button variant="info" className="w-100 mb-2" onClick={() => handleNavigation("/incregistration")}>
            Go to Inc Registration
          </Button>
          <Button variant="dark" className="w-100" onClick={() => handleNavigation("/wardinglogs")}>
            Go to Dashboard
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Login;