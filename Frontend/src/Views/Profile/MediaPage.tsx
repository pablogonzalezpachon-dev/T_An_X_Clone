import React from "react";
import FallBack from "../../Lib/Assets/FallBack";

type Props = {};

function MediaPage({}: Props) {
  return (
    <>
      <FallBack
        content="When you post photos or videos, they will show up here."
        title="Lights, camera … attachments!"
      ></FallBack>
    </>
  );
}

export default MediaPage;
