/**
 * Stackoverflow event
 */

// https://api.stackexchange.com/docs/types/user-timeline
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
  title?: string;
  creation_date: number; //unix epoch time
}

type StackoverflowEventType =
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

export interface StackoverflowActivityEvent {
  source: "github" | "stackoverflow"; // TODO: remove this?
  eventType: StackoverflowEventType;
  eventURL: string;
  questionTitle: string;
  createdAt: number; //unix epoch time
}

function deriveStackoverflowEventType(
  timelineType: string,
  postType: string
): StackoverflowEventType {
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
): StackoverflowActivityEvent {
  return {
    source: "stackoverflow",
    eventType: deriveStackoverflowEventType(
      external.timeline_type,
      external.post_type
    ),
    eventURL: external.link,
    questionTitle: external.title || "",
    createdAt: external.creation_date,
  };
}
