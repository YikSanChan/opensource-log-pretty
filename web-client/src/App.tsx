import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import {
  listGithubActivityEvents,
  listStackoverflowActivityEvents,
} from "./api";
import { Layout, Table } from "antd";
import { ActivityEvent } from "./types";
import { formatDate } from "./format";
const { Content } = Layout;

const GITHUB_USERNAME = "yiksanchan";
const STACKOVERFLOW_USERID = 7550592;
const STACKEXCHANGE_API_DEFAULT_PAGE_SIZE = 30;

const columns = [
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (createdAt: Date) => formatDate(createdAt),
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
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
];

function App() {
  const [
    stackoverflowActivityEvents,
    setStackoverflowActivityEvents,
  ] = useState<ActivityEvent[]>([]);

  const [githubActivityEvents, setGithubActivityEvents] = useState<
    ActivityEvent[]
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
