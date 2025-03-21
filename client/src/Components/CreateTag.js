import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { getIp, getUserId } from "./Vars";
import FormControl from "react-bootstrap/FormControl";
import Badge from "react-bootstrap/Badge";
import { toast, Toaster } from "react-hot-toast";

const CreateTag = (props) => {
  const vid = props.id;
  const tagName = props.tagName;
  const tagTooltip = props.tagTooltip;
  const tagId = props.tagId;
  const userId = props.userId;
  const [isClicked, setIsClicked] = useState(false);
  const [hasTag, setHasTag] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddtag = () => {
    if (isClicked || hasTag) return; // Prevent multiple clicks or if tag already exists
    
    setIsClicked(true);
    
    fetch(
      getIp() + "/addTag?id=" + vid + "&tag=" + tagId + "&uid=" + userId + "",
      {
        method: "POST",
      }
    )
      .then((response) => {
        if (response.ok) {
        //   toast.success(`Saved ` + tagName);
          setHasTag(true);
        } else {
          throw new Error("Server responded with an error");
        }
      })
      .catch((error) => {
        setIsClicked(false); // Reset clicked state on error
        toast.error("Error saving tag");
      });
  };
  const handleDeleteTag = (e) => {
    e.stopPropagation(); // Prevent the badge's onClick from firing
    setIsLoading(true);
    
    // Construct URL with matching query parameters
    fetch(
      getIp() +
        "/deleteCreatedTag?id=" +
        vid +
        "&tagid=" +
        tagId +
        "&uid=" +
        userId,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        if (response.ok) {
        //   toast.success(`Removed ${tagName}`);
          setHasTag(false);
          setIsClicked(false);
        } else {
          throw new Error("Server responded with an error");
        }
      })
      .catch((error) => {
        toast.error("Error removing tag");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
  
    fetch(getIp() + `/checkIfHasTag?id=${vid}&tag=${tagId}`)
      .then(response => response.json())
      .then(data => {
        if (data.hasTag) {
          setHasTag(true);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error checking tag status:', error);
        setIsLoading(false);
      });
  }, [vid, tagId]);

  // Determine badge state based on loading, hasTag, and isClicked
  const badgeState = isLoading ? "loading" : hasTag || isClicked ? "tagged" : "default";

  return (
    <>
      {/* <Toaster /> */}
      <Badge
        bg={badgeState === "tagged" ? "success" : badgeState === "loading" ? "light" : "secondary"}
        style={{
          cursor: badgeState === "default" ? "pointer" : "default",
          fontSize: "16px",
          opacity: badgeState === "loading" ? 0.5 : badgeState === "tagged" ? 0.7 : 1,
          position: "relative",
          paddingRight: badgeState === "tagged" && isHovered ? "28px" : undefined
        }}
        className="mx-1 my-1"
        data-toggle="tooltip"
        title={badgeState === "tagged" ? `${tagName} (Added)` : tagName}
        onClick={() => badgeState === "default" && handleAddtag()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <i className={`bi ${badgeState === "loading" ? "bi-hourglass-split" : badgeState === "tagged" ? "bi-tag-fill" : "bi-tag"}`}></i>{" "}
        {tagTooltip}
        
        {/* Delete button that appears when tagged badge is hovered */}
        {badgeState === "tagged" && isHovered && (
          <span
            onClick={handleDeleteTag}
            style={{
              position: "absolute",
              right: "5px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px"
            }}
            title="Remove tag"
          >
            <i className="bi bi-x"></i>
          </span>
        )}
      </Badge>
    </>
  );
};

export default CreateTag;