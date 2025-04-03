import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import CreateTag from './CreateTag';

const Position2025Section = ({ leader, userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = () => {
    setIsOpen(prev => !prev);
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
        <span><strong>Tags</strong></span>
        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
      </Button>
      
      {isOpen && (
        <div className="collapse mt-2 show" id={`position-collapse-${leader.v_id}`}>
          <Card className="border-0">
            <Card.Body className="p-2">
              <CreateTag
                id={leader.v_id}
                tagName="Iglesia ni Cristo Leader's Meeting 2025"
                tagTooltip="INC"
                tagId="683"
                userId={userId}
              />
              <CreateTag
                id={leader.v_id}
                tagName="Barangay Nutrition Scholar 2025"
                tagTooltip="BNS"
                tagId="684"
                userId={userId}
              />
              <CreateTag
                id={leader.v_id}
                tagName="Barangay Health Worker 2025"
                tagTooltip="BHW"
                tagId="685"
                userId={userId}
              />
              <CreateTag
                id={leader.v_id}
                tagName="BPSO 2025"
                tagTooltip="BPSO"
                tagId="686"
                userId={userId}
              />
              <CreateTag
                id={leader.v_id}
                tagName="Barangay Kagawad 2025"
                tagTooltip="BK"
                tagId="687"
                userId={userId}
              />
              <CreateTag
                id={leader.v_id}
                tagName="Punong Barangay 2025"
                tagTooltip="PB"
                tagId="688"
                userId={userId}
              />
              <CreateTag
                id={leader.v_id}
                tagName="SK Chairman 2025"
                tagTooltip="SKC"
                tagId="689"
                userId={userId}

              />
              <CreateTag
                id={leader.v_id}
                tagName="Barangay Secretary 2025"
                tagTooltip="BS"
                tagId="690"
                userId={userId}
              />
              <CreateTag
                id={leader.v_id}
                tagName="Barangay Treasurer 2025"
                tagTooltip="TREAS"
                tagId="691"
                userId={userId}
              />
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Position2025Section;