import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button, Table, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getIp } from "./Vars";

const WardingListAll = () => {
    const navigate = useNavigate();
    if (sessionStorage.length === 0) {
        navigate("/login");
    }

    const userData = sessionStorage.getItem("user");
    const parsedUserData = JSON.parse(userData);
    const userId = parsedUserData.user_id;

    const [municipality, setMunicipality] = useState("");
    const [barangays, setBarangays] = useState([]);
    const [barangay, setBarangay] = useState("");

    const [households, setHouseholds] = useState([]);

    const handleMunicipalityChange = (event) => {
        const selectedMunicipality = event.target.value;
        setMunicipality(selectedMunicipality);

        fetch(getIp() + `/getBarangay?municipality=${selectedMunicipality}`)
            .then((response) => response.json())
            .then((data) => {
                setBarangays(data);
                //  console.log(JSON.stringify(data));
            })
            .catch((error) =>
                console.error("Error on fetching barangays: " + error)
            );
    };

    const handleBarangayChange = (event) => {
        setBarangay(event.target.value);
    };

    useEffect(() => {
        fetch(getIp() + `/getHouseholdsAll?mun=${municipality}&brgy=${barangay}`)
            .then((response) => response.json())
            .then((data) => setHouseholds(data))
            .catch((error) => console.error("ERR: " + error));
    }, [barangay]);

    // Function to handle deletion of a household
    const handleDeleteHousehold = (indexToDelete, id) => {
        const updatedHouseholds = households.filter((_, index) => index !== indexToDelete);
        try {
            fetch(
                getIp() +
                "/deleteHousehold?fhid=" + id + "",
                {
                    method: "POST",
                }
            );
            setHouseholds(updatedHouseholds);
        } catch (error) {
            console.error("Error while saving:", error);
        }
    };

    const handleAddLeader = (id) => {
        try {
            alert("Hello World");
            // fetch(
            //     getIp() +
            //     "/deleteHousehold?fhid=" + id + "",
            //     {
            //         method: "POST",
            //     }
            // );
        } catch (error) {
            console.error("Error while saving:", error);
        }
    };

    return (
        <>
            <Container fluid="false" className="py-5 poppins-regular px-5">
                <Row>
                    <Col xl={6}>
                        <Form.Select
                            aria-label="Municipality"
                            data-toggle="tooltip"
                            title="Municipality"
                            className="mb-3"
                            onChange={handleMunicipalityChange}
                            style={{ textTransform: "uppercase" }}
                            value={municipality}
                        >
                            <option value="">Select Municipality</option>
                            <option value="BAGAMANOC">BAGAMANOC</option>
                            <option value="BARAS">BARAS</option>
                            <option value="BATO">BATO</option>
                            <option value="CARAMORAN">CARAMORAN</option>
                            <option value="GIGMOTO">GIGMOTO</option>
                            <option value="PANDAN">PANDAN</option>
                            <option value="PANGANIBAN">PANGANIBAN</option>
                            <option value="SAN ANDRES">SAN ANDRES</option>
                            <option value="SAN MIGUEL">SAN MIGUEL</option>
                            <option value="VIGA">VIGA</option>
                            <option value="VIRAC">VIRAC</option>
                        </Form.Select>
                    </Col>
                    <Col xl={6}>
                        <Form.Select
                            aria-label="Barangay"
                            data-toggle="tooltip"
                            title="Barangay"
                            className="mb-3"
                            onChange={handleBarangayChange}
                            value={barangay}
                        >
                            <option value="">Select Barangay</option>
                            {barangays.map((barangay, index) => (
                                <option key={index} value={barangay.v_barangay}>
                                    {barangay.v_barangay}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        {/* {JSON.stringify(households)} */}
                        <div>
                            {households.map((family, index) => (
                                <div key={index} style={{ marginBottom: '20px' }}>
                                    <Row>
                                        <Col lg={1}>
                                           <h1>{index + 1}</h1>
                                        </Col>
                                        <Col lg={11}>
                                            <table className="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Family Head (FH)</th>
                                                        <th>Member Name</th>
                                                        <th>Municipality</th>
                                                        <th>Barangay</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {family.members.length > 0 ? (
                                                        family.members.map((member, memberIndex) => (
                                                            <tr key={memberIndex}>
                                                                <td>{memberIndex === 0 ? family.fh : ''}</td>
                                                                <td>{memberIndex + 1}. {member.fullname}</td>
                                                                <td>{member.v_municipality}</td>
                                                                <td>{member.v_barangay}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td>{family.fh}</td>
                                                            <td colSpan="3">No members</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </Col>
                                    </Row>

                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default WardingListAll;
