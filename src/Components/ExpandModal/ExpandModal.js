import React from "react";
import { IoMdExpand } from "react-icons/io";
import { useZafClient } from "../../utils/zafClient";
import { ApiConfig } from "../../Config/ApiConfig";
import { Tooltip as ReactTooltip } from "react-tooltip";
const ExpandModal = () => {
  const client = useZafClient();

  const handleClick = async () => {
    try {
      const contextData = await client?.context?.();
      const ticketData = await client?.get?.("ticket");

      const subdomain = contextData?.account?.subdomain || "";
      const ticketId = contextData?.ticketId || 0;
      const ticketStatus = ticketData?.ticket?.status || "";
      const tags = ticketData?.ticket?.tags || [];
      const comments = ticketData?.ticket?.comments || [];
      const assigneeId = ticketData?.ticket?.assignee?.user?.id || 0;
      const requesterId = ticketData?.ticket?.requester?.id || 0;
      const groupName = ticketData?.ticket?.assignee?.group?.name || "";
      const groupId = ticketData?.ticket?.assignee?.group?.id || "";

      // Save to localStorage
      // localStorage.setItem("subdomain", subdomain);
      // localStorage.setItem("ticketId", ticketId);
      // localStorage.setItem("ticketStatus", ticketStatus);
      // localStorage.setItem("tags", JSON.stringify(tags));
      // localStorage.setItem("comments", JSON.stringify(comments));
      // localStorage.setItem("assigneeId", assigneeId.toString());
      // localStorage.setItem("requesterId", requesterId.toString());
      // localStorage.setItem("groupName", groupName);
      // localStorage.setItem("groupId", groupId.toString());
      localStorage.setItem("subdomain", subdomain);
      localStorage.setItem("ticketId", ticketId);
      localStorage.setItem("ticketStatus", ticketStatus);
      localStorage.setItem("tags", JSON.stringify(tags));
      localStorage.setItem("comments", JSON.stringify(comments));
      localStorage.setItem("assigneeId", assigneeId);
      localStorage.setItem("requesterId", requesterId);
      localStorage.setItem("groupName", groupName);
      localStorage.setItem("groupId", groupId.toString());

      await client?.invoke?.("instances.create", {
        location: "modal",
        url: ApiConfig.modal, // Update this to point to your modal content
        size: {
          width: "80vw", // Adjust width as needed
          height: "80vh", // Adjust height as needed
        },
      });

      //   const location = modalContext?.["instances.create"]?.[0]?.location;
    } catch (error) {
      console.error("Error creating instance or fetching data:", error);
    }
  };

  return (
    <>
      <IoMdExpand
        className="grow-icon"
        data-tooltip-id="expand"
        style={{
          cursor: "pointer",
          fontSize: "1.5rem",
          width: "30px",
          height: "30px",
        }}
        onClick={handleClick}
      />
      <ReactTooltip
        id="expand"
        place="top"
        content={`Expand`}
        style={{ zIndex: "9999" }}
      />
    </>
  );
};

export default ExpandModal;
