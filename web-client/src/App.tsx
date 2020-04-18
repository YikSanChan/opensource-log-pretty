import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { listActivityEvents } from "./api";
import { Button, Col, Form, Input, List, Row } from "antd";
import { ActivityEvent } from "./types";
import { FaGithub, FaStackOverflow } from "react-icons/fa";
import { Typography } from "antd";

const { Title } = Typography;

function zip2(a: string[], b: string[]) {
  const arr = [];
  for (const key in a) arr.push([a[key], b[key]]);
  return arr;
}

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

function ActivityEventRow(props: ActivityEvent) {
  // Treat this differently
  const isGithubPushCommits =
    props.source === "github" && props.what.do === "pushed commits";
  const when = <span>{formatDate(props.when)}</span>;
  const who = (
    <span>
      <a href={props.who.profileURL}>{props.who.username}</a>
    </span>
  );
  const what = (
    <span>
      {props.what.do}{" "}
      {isGithubPushCommits ? (
        ""
      ) : (
        <a href={props.what.somethingURL}>{props.what.somethingDisplay}</a>
      )}
    </span>
  );
  let where;
  if (props.where) {
    where = (
      <span>
        {" "}
        {props.where.prep}{" "}
        <a href={props.where.somewhereURL}>{props.where.somewhereDisplay}</a>
      </span>
    );
  }
  const title = (
    <div>
      At {when}, {who} {what} {where || ""}
    </div>
  );
  let description;
  if (isGithubPushCommits) {
    const commitMessages = JSON.parse(props.what.somethingDisplay);
    const commitURLs = JSON.parse(props.what.somethingURL);
    description = (
      <ul>
        <li>
          {zip2(commitMessages, commitURLs).map((e) => (
            <a href={e[1]}>{e[0]}</a>
          ))}
        </li>
      </ul>
    );
  }
  return (
    <List.Item>
      <List.Item.Meta
        avatar={
          props.source === "github" ? (
            <FaGithub style={{ fontSize: "20px" }} />
          ) : (
            <FaStackOverflow style={{ fontSize: "20px" }} />
          )
        }
        title={title}
        description={description}
      />
    </List.Item>
  );
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
          renderItem={(item) => <ActivityEventRow {...item} />}
        />
      </Col>
    </Row>
  );
}

export default App;
