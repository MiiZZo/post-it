import { Provider } from "effector-react/ssr";
import { Scope } from "effector/fork";
import { Pages } from "client/pages";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

interface Props {
  root: Scope;
}

export const App = ({ root }: Props) => {
  return (
    <Provider value={root}>
      <ChakraProvider>
        <Pages />
      </ChakraProvider>
    </Provider>
  );
};
 