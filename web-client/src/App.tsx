import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import {
  listGithubActivityEvents,
  listStackoverflowActivityEvents,
} from "./api";
import { StackoverflowActivityEvent } from "./stackoverflow-types";
import { Layout, Table } from "antd";
import { formatUnixEpochSecond } from "./format";
import { GithubActivityEvent } from "./github-types";
const { Content } = Layout;

const GITHUB_USERNAME = "yiksanchan";
const STACKOVERFLOW_USERID = 7550592;
const STACKEXCHANGE_API_DEFAULT_PAGE_SIZE = 30;

const columns = [
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (createdAt: number) => formatUnixEpochSecond(createdAt),
  },
  {
    title: "Source",
    dataIndex: "source",
    key: "source",
  },
  {
    title: "Event Type",
    dataIndex: "eventType",
    key: "eventType",
  },
  {
    title: "Event URL",
    dataIndex: "eventURL",
    key: "eventURL",
    render: (eventURL: string) => <a href={eventURL}>Click</a>,
  },
  {
    title: "Question Title",
    dataIndex: "questionTitle",
    key: "questionTitle",
  },
];

function App() {
  const [
    stackoverflowActivityEvents,
    setStackoverflowActivityEvents,
  ] = useState<StackoverflowActivityEvent[]>([]);

  const [githubActivityEvents, setGithubActivityEvents] = useState<
    GithubActivityEvent[]
  >([]);

  useEffect(() => {
    listStackoverflowActivityEvents(STACKOVERFLOW_USERID).then((events) => {
      setStackoverflowActivityEvents(events);
    });
  }, []);

  useEffect(() => {
    listGithubActivityEvents(GITHUB_USERNAME).then((events) =>
      setGithubActivityEvents(events)
    );
  }, []);

  // page size=30: match stackexchange api page size
  return (
    <Layout>
      <Content>
        <Table
          pagination={{ pageSize: 100 }}
          dataSource={githubActivityEvents}
          columns={columns}
        />
        <Table
          pagination={{ pageSize: STACKEXCHANGE_API_DEFAULT_PAGE_SIZE }}
          dataSource={stackoverflowActivityEvents}
          columns={columns}
        />
      </Content>
    </Layout>
  );
}

export default App;
