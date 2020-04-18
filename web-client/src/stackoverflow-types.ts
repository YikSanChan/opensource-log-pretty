// Comes from Stackexchange API
// https://api.stackexchange.com/docs/types/user-timeline
import { ActivityEvent } from "./types";

export interface StackoverflowUserTimeline {
  user_id: number;
  badge_id?: number;
  comment_id?: number;
  post_id?: number;
  suggested_edit_id?: number;
  detail?: string;
  link: string;
  post_type: "question" | "answer";
  timeline_type:
    | "commented"
    | "asked"
    | "answered"
    | "badge"
    | "revision"
    | "accepted"
    | "reviewed"
    | "suggested";
  // TODO: is it possible to have null question title?
  // TODO: title contains html encoded string such as &gt;
  title?: string;
  creation_date: number; //unix epoch time
}

type SupportedStackoverflowEventType =
  | "commented question" //post a comment
  | "asked question" //
  | "revision question" //edit a post
  | "answered answer" //post an answer
  | "commented answer"
  | "revision answer"
  | "accepted answer" //
  | "unrecognized";
// | "badge question" //earn a budget
// | "reviewed question" //review a suggested edit
// | "suggested question" //suggest an edit

function deriveStackoverflowEventType(
  timelineType: string,
  postType: string
): SupportedStackoverflowEventType {
  const eventType = `${timelineType} ${postType}`;
  switch (eventType) {
    case "commented question":
    case "asked question":
    case "revision question":
    case "answered answer":
    case "commented answer":
    case "revision answer":
    case "accepted answer":
      return eventType;
    default:
      return "unrecognized";
  }
}

export function convertStackoverflowUserTimeline(
  external: StackoverflowUserTimeline
): ActivityEvent {
  return {
    source: "stackoverflow",
    what: {
      do: deriveStackoverflowEventType(
        external.timeline_type,
        external.post_type
      ),
      somethingDisplay: external.title || "",
      somethingURL: external.link,
    },
    when: new Date(external.creation_date * 1000),
  };
}
