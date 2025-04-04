import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import CreateTag from "./CreateTag";

const HouseholdWardingTags = ({ leader, userId, mun }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="position-relative mb-2">
      <Button
        variant="outline-primary"
        size="sm"
        className="w-100 d-flex justify-content-between align-items-center"
        onClick={toggleSection}
        id={`position-button-${leader.v_id}`}
      >
        <span>
          <strong>Tags</strong>
        </span>
        <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
      </Button>

      {isOpen && (
        <div
          className="collapse mt-2 show"
          id={`position-collapse-${leader.v_id}`}
        >
          <Card className="border-0">
            <Card.Body className="p-2">
              <div>Congressman</div>
              <CreateTag
                id={leader.v_id}
                tagName="Samuel Laynes (Survey 2025)"
                tagTooltip="SL"
                tagId="660"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="Leo Rodriguez (Survey 2025)"
                tagTooltip="LR"
                tagId="661"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="Jan Alberto (Survey 2025)"
                tagTooltip="JA"
                tagId="678"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="UndecidedCong(Survey 2025)"
                tagTooltip="UD"
                tagId="679"
                userId={userId}
              />
              <br></br>
              <div>Governor</div>
              <CreateTag
                id={leader.v_id}
                tagName="BossTe(Survey 2025)"
                tagTooltip="PC"
                tagId="662"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="Asanza(Survey 2025)"
                tagTooltip="PA"
                tagId="663"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="UndecidedGov(Survey 2025)"
                tagTooltip="UD"
                tagId="680"
                userId={userId}
              />
              <br></br>
              <div>Vice-Governor</div>
              <CreateTag
                id={leader.v_id}
                tagName="Fernandez(Survey 2025)"
                tagTooltip="OF"
                tagId="676"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="Abundo(Survey 2025)"
                tagTooltip="SA"
                tagId="677"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="UndecidedVGov(Survey 2025)"
                tagTooltip="UD"
                tagId="681"
                userId={userId}
              />
              {mun == "VIRAC" && (
                <>
                  <div>Mayor</div>
                  <CreateTag
                    id={leader.v_id}
                    tagName="Boboy Cua(Survey 2025)"
                    tagTooltip="BC"
                    tagId="693"
                    userId={userId}
                  />

                  <CreateTag
                    id={leader.v_id}
                    tagName="Posoy(Survey 2025)"
                    tagTooltip="PS"
                    tagId="694"
                    userId={userId}
                  />

                  <CreateTag
                    id={leader.v_id}
                    tagName="Arcilla(Survey 2025)"
                    tagTooltip="AA"
                    tagId="695"
                    userId={userId}
                  />

                  <CreateTag
                    id={leader.v_id}
                    tagName="UndecidedMayor(Survey 2025)"
                    tagTooltip="UD"
                    tagId="696"
                    userId={userId}
                  />
                </>
              )}

              <br></br>
              <div>Others</div>
              <CreateTag
                id={leader.v_id}
                tagName="Outside Province(Household Warding)"
                tagTooltip="OP"
                tagId="626"
                userId={userId}
              />

              <CreateTag
                id={leader.v_id}
                tagName="Needs Assistance(Household Warding)"
                tagTooltip="NA"
                tagId="682"
                userId={userId}
              />
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HouseholdWardingTags;
