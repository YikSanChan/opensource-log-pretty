import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { listActivityEvents } from "./api";
import { Layout, Table } from "antd";
import { ActivityEvent } from "./types";
import { formatCommaSeparatedURLs, formatDate } from "./format";
const { Content } = Layout;

const GITHUB_USERNAME = "yiksanchan";
const STACKOVERFLOW_USERID = 7550592;

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
    render: (eventURL: string) => formatCommaSeparatedURLs({ s: eventURL }),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
];

function App() {
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    listActivityEvents(STACKOVERFLOW_USERID, GITHUB_USERNAME).then((events) => {
      setActivityEvents(events);
    });
  }, []);

  return (
    <Layout>
      <Content>
        <Table
          pagination={{ pageSize: 30 }}
          dataSource={activityEvents}
          columns={columns}
        />
      </Content>
    </Layout>
  );
}

export default App;
