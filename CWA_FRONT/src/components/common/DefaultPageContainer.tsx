import { Flex } from "antd";
import React from "react";

export default function DefaultPageContainer({
    children,
}: { children: any}) {
  return <Flex justify="center" className="w-full h-full">
    <Flex className="w-70 h-full bg-white-500" style={{ width: '60%'}}>
    {children}
    </Flex>
  </Flex>
}