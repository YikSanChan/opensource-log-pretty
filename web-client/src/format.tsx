import React, { ReactNode } from "react";

export function formatCommaSeparatedURLs(props: {
  commaSeparatedURL: string;
  content: string;
}): ReactNode {
  const urls = props.commaSeparatedURL.split(",");
  return (
    <span>
      {urls.map((url) => (
        <a href={url}>{props.content} </a>
      ))}
    </span>
  );
}
