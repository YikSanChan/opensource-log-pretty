import React, { ReactNode } from "react";

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function formatCommaSeparatedURLs(props: { s: string }): ReactNode {
  const urls = props.s.split(",");
  return (
    <ul>
      {urls.map((url) => (
        <li>
          <a href={url}>Click</a>
        </li>
      ))}
    </ul>
  );
}
