import React, { useState, useEffect, useContext } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Table,
} from "react-bootstrap";
import NewType from "./GetLeaderType";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { getIp, getUserId } from "./Vars";

import NewTag from "./NewTag";

import VoterImage from "./GetImage";
import GetData from "./GetData";
import GetFb from "./GetFb";
import GetUploads from "./VoterUploads";
import FBInputs from "./FacebookInputs";
import GetLeader from "./GetLeader";
import GetWarded from "./GetWarded";
import GetTags from "./GetTags";

import ReactPaginate from "react-paginate";
import ReactDOM from "react-dom";

import Badge from "react-bootstrap/Badge";
import Accordion from "react-bootstrap/Accordion";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import VoterProfile from "./VoterProfile";
import { toast, Toaster } from "react-hot-toast";
import MunicipalityBarangaySelect from "./LocationSelects";

const HouseholdWarding = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;


  return (
    <>
      <Container fluid="false" className="py-5 poppins-regular px-5">
        <Toaster />
        
      </Container>
    </>
  );
};

export default HouseholdWarding;
