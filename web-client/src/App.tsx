import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { listActivityEvents } from "./api";
import { Button, Col, Form, Input, List, Row } from "antd";
import { ActivityEvent } from "./types";
import { FaGithub, FaStackOverflow } from "react-icons/fa";
import { formatCommaSeparatedURLs } from "./format";
import { Typography } from "antd";

const { Title } = Typography;

// const GITHUB_USERNAME = "yiksanchan";
// const STACKOVERFLOW_USERID = 7550592;

function formatDate(date: Date): string {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString("en", options);
}

function App() {
  const [githubUsername, setGithubUsername] = useState<string | undefined>(
    undefined
  );
  const [stackoverflowUserId, setStackoverflowUserId] = useState<
    string | undefined
  >(undefined);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    listActivityEvents(stackoverflowUserId, githubUsername).then((events) => {
      setActivityEvents(events);
    });
  }, [githubUsername, stackoverflowUserId]);

  function onFinish(values: any) {
    if (values.githubUsername === undefined || values.githubUsername === "")
      setGithubUsername(undefined);
    else setGithubUsername(values.githubUsername);
    if (
      values.stackoverflowUserId === undefined ||
      values.stackoverflowUserId === ""
    )
      setStackoverflowUserId(undefined);
    else setStackoverflowUserId(values.stackoverflowUserId);
  }

  return (
    <Row>
      <Col span={12} offset={6}>
        <Title>Open Source Tracker</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            label={
              <div>
                <FaGithub style={{ fontSize: "16px" }} /> GitHub
              </div>
            }
            name="githubUsername"
          >
            <Input placeholder="username" />
          </Form.Item>
          <Form.Item
            label={
              <div>
                <FaStackOverflow style={{ fontSize: "16px" }} /> Stack Overflow
              </div>
            }
            name="stackoverflowUserId"
          >
            <Input placeholder="user id" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Try!
            </Button>
          </Form.Item>
        </Form>
        <List
          itemLayout="horizontal"
          dataSource={activityEvents}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.source === "github" ? (
                    <FaGithub style={{ fontSize: "20px" }} />
                  ) : (
                    <FaStackOverflow style={{ fontSize: "20px" }} />
                  )
                }
                title={
                  <div>
                    At {formatDate(item.createdAt)},{" "}
                    {formatCommaSeparatedURLs({
                      commaSeparatedURL: item.eventURL,
                      content: item.eventType,
                    })}
                  </div>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
}

export default App;
