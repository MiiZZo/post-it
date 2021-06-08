import { Button } from "@chakra-ui/button";
import { createStart, useStart, withStart } from "common/lib/page-routing";
import React from "react";

export const HomePage = () => {  
  return (
    <Button onClick={() => alert("alert was called because u clicked to the button!!!")}>click to call alert</Button>
  );
};
