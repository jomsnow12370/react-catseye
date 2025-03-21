import React, { useState, useEffect } from "react";
import { Form, Col } from "react-bootstrap";
import { getIp } from "./Vars";

const MunicipalityBarangaySelect = ({
  municipality,
  setMunicipality,
  barangay,
  setBarangay,
}) => {
  const [barangays, setBarangays] = useState([]);

  useEffect(() => {
    if (municipality) {
      fetch(getIp() + `/getBarangay?municipality=${municipality}`)
        .then((response) => response.json())
        .then((data) => setBarangays(data))
        .catch((error) => console.error("Error fetching barangays:", error));
    } else {
      setBarangays([]);
    }
  }, [municipality]);

  return (
    <>
      <Col xl={6} xs={6}>
        <Form.Select
          aria-label="Municipality"
          className="mb-3"
          onChange={(e) => setMunicipality(e.target.value)}
          value={municipality}
        >
          <option value="">Select Municipality</option>
          {["BAGAMANOC", "BARAS", "BATO", "CARAMORAN", "GIGMOTO", "PANDAN", "PANGANIBAN", "SAN ANDRES", "SAN MIGUEL", "VIGA", "VIRAC"].map((mun) => (
            <option key={mun} value={mun}>
              {mun}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col xl={6} xs={6}>
        <Form.Select
          aria-label="Barangay"
          className="mb-3"
          onChange={(e) => setBarangay(e.target.value)}
          value={barangay}
          disabled={!municipality}
        >
          <option value="">Select Barangay</option>
          {barangays.map((brgy, index) => (
            <option key={index} value={brgy.barangay}>
              {brgy.barangay}
            </option>
          ))}
        </Form.Select>
      </Col>
    </>
  );
};

export default MunicipalityBarangaySelect;
