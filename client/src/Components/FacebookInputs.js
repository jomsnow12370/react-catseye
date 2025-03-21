import React, { useState, useEffect } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import { Row, Col, Button, Form, FormGroup } from "react-bootstrap";
import { getIp } from "./Vars";
import { toast, Toaster } from "react-hot-toast";

const FBInputs = (props) => {
  const id = props.id;
  const [fbType, setfbType] = useState("1"); // nodata
  const [fbLink, setfbLink] = useState(""); // nodata
  const [isSubmitting, setIsSubmitting] = useState(false); // To track button state

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  useEffect(() => {
    // fetch(getIp()+"/getAllTags")
    //   .then((response) => response.json())
    //   .then((data) => [setTags(data), console.log(data)])
    //   .catch((error) => console.error("ERR: " + error));
  }, []);

  const handleSelectChange = (event) => {
    console.log(event.target.value);
    setfbType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true); // Disable button after click

    try {
      fetch(
        getIp() +
          "/saveFB?id=" +
          id +
          "&fblink=" +
          fbLink +
          "&fbtype=" +
          fbType +
          "&uid=" +
          userId +
          "",
        {
          method: "POST",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          toast.success("Record saved");
          setfbLink("");
          setfbType("1");
          setIsSubmitting(false); // Enable the button again after saving
        })
        .catch((error) => {
          console.error("Error on handleSubmit: " + error);
          setIsSubmitting(false); // Enable the button again if there's an error
        });
    } catch (error) {
      console.error("Error", error);
      alert("Error");
      setIsSubmitting(false); // Enable the button again if there's an error
    }
  };

  return (
    <>
      <h5 className="text-secondary">Facebook</h5>
      <Toaster />
      <Form onSubmit={handleSubmit}>
        <FormGroup className="mb-3">
          <Form.Select
            size="sm"
            aria-label="Default select example"
            value={fbType}
            onChange={handleSelectChange}
            style={{ borderRadius: "50px", textIndent: "10px" }}
            disabled={isSubmitting} // Disable select when submitting
          >
            <option disabled>SELECT OPTION</option>
            <option value="1">YES FB</option>
            <option value="2">NO FB</option>
            <option value="3">INACTIVE</option>
            <option value="4">LOCKED</option>
          </Form.Select>
        </FormGroup>

        {fbType !== "2" && (
          <FormGroup className="mb-3">
            <Form.Control
              size="sm"
              placeholder="Facebook Link"
              value={fbLink}
              onChange={(e) => setfbLink(e.target.value)}
              style={{ borderRadius: "50px", textIndent: "10px" }}
              disabled={isSubmitting} // Disable input when submitting
            ></Form.Control>
          </FormGroup>
        )}

        <Button
          size="sm"
          variant="outline-secondary"
          className="mb-3 float-right"
          type="submit"
          style={{ borderRadius: "50px", textIndent: "10px" }}
          disabled={isSubmitting} // Disable button when submitting
        >
          {isSubmitting ? "Saving..." : "Save"} <i className="bi bi-upload"></i>
        </Button>
      </Form>
    </>
  );
};

export default FBInputs;
