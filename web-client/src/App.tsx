import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { listActivityEvents } from "./api";
import { Col, List, Row } from "antd";
import { ActivityEvent } from "./types";
import { AiOutlineGithub } from "react-icons/ai";
import { FaStackOverflow } from "react-icons/fa";
import { formatCommaSeparatedURLs } from "./format";

const GITHUB_USERNAME = "yiksanchan";
const STACKOVERFLOW_USERID = 7550592;

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
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    listActivityEvents(STACKOVERFLOW_USERID, GITHUB_USERNAME).then((events) => {
      setActivityEvents(events);
    });
  }, []);

  return (
    <Row>
      <Col span={12} offset={6}>
        <List
          itemLayout="horizontal"
          dataSource={activityEvents}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.source === "github" ? (
                    <AiOutlineGithub style={{ fontSize: "20px" }} />
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
