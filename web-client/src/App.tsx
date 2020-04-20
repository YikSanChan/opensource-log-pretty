import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { listActivityEvents } from "./api";
import { Button, Col, Form, Input, List, Row } from "antd";
import { ActivityEvent } from "./types";
import { FaGithub, FaStackOverflow } from "react-icons/fa";
import { Typography } from "antd";
import GitHubButton from "react-github-btn";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

const { Title } = Typography;

function zip2(a: string[], b: string[]) {
  const arr = [];
  for (const key in a) arr.push([a[key], b[key]]);
  return arr;
}

// TODO: it is not respecting 2-digit hour, see https://stackoverflow.com/q/56469995
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

function convertNullableToUndefinable(nullable: string | null) {
  return nullable === null ? undefined : nullable;
}

function PageHeader() {
  return (
    <Row
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Col span={21}>
        <Title>opensource log --pretty</Title>
      </Col>
      <Col span={2.5}>
        <GitHubButton
          href="https://github.com/yiksanchan/opensource-log-pretty"
          data-icon="octicon-star"
          data-show-count
          data-size="large"
          aria-label="Star yiksanchan/opensource-log-pretty on GitHub"
        >
          Star
        </GitHubButton>
      </Col>
    </Row>
  );
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
        <li style={{ marginLeft: "-20px" }}>
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

type SearchFormProps = {
  githubUsername?: string;
  stackoverflowUserId?: string;
};

function onFinish(values: any) {
  let params = {};
  if (values.githubUsername)
    params = { ...params, github: values.githubUsername };
  if (values.stackoverflowUserId)
    params = { ...params, stackoverflow: values.stackoverflowUserId };
  const query = new URLSearchParams(params).toString();
  window.location.href = "?" + query;
}

function SearchForm(props: SearchFormProps) {
  return (
    <Form initialValues={{ ...props }} onFinish={onFinish} layout="vertical">
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
  );
}

function Content() {
  const query = new URLSearchParams(useLocation().search);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  const stackoverflowUserId = convertNullableToUndefinable(
    query.get("stackoverflow")
  );
  const githubUsername = convertNullableToUndefinable(query.get("github"));

  useEffect(() => {
    listActivityEvents(stackoverflowUserId, githubUsername).then((events) => {
      setActivityEvents(events);
    });
  }, []);

  return (
    <Row>
      <Col span={12} offset={6}>
        <PageHeader />
        <SearchForm
          githubUsername={githubUsername}
          stackoverflowUserId={stackoverflowUserId}
        />
        <List
          itemLayout="horizontal"
          dataSource={activityEvents}
          renderItem={(item) => <ActivityEventRow {...item} />}
        />
      </Col>
    </Row>
  );
}

function App() {
  return (
    <Router>
      <Content />
    </Router>
  );
}

export default App;
