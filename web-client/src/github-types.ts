import { Endpoints } from "@octokit/types";
import { ActivityEvent } from "./types";

export type ListUserPublicEventsParameters = Endpoints["GET /users/:username/events/public"]["parameters"];

// https://developer.github.com/v3/activity/events/types/
type GithubActivityEventType =
  | "WatchEvent"
  | "PushEvent"
  | "CreateEvent"
  | "IssueCommentEvent"
  | "PullRequestEvent"
  | "ForkEvent"
  | "IssueEvent"
  | "PullRequestReviewCommentEvent";

// TODO: https://developer.github.com/v3/activity/events/types/#events-api-payload-2 doesn't seem correct
type GithubCreateEventRefType = "branch" | "tag" | "repository";

type GithubWatchAction = "started";

type GithubIssueCommentAction = "created" | "edited" | "deleted";

type GithubPullRequestAction =
  | "assigned"
  | "unassigned"
  | "labeled"
  | "unlabeled"
  | "opened"
  | "edited"
  | "closed"
  | "reopened"
  | "synchronize"
  | "ready_for_review"
  | "locked"
  | "unlocked";

type GithubIssuesAction =
  | "opened"
  | "edited"
  | "deleted"
  | "pinned"
  | "unpinned"
  | "closed"
  | "reopened"
  | "assigned"
  | "unassigned"
  | "labeled"
  | "unlabeled"
  | "locked"
  | "unlocked"
  | "transferred"
  | "milestoned"
  | "demilestoned";

type PullRequestReviewCommentAction = "created" | "edited" | "deleted";

interface Repo {
  id: string;
  name: string;
  url: string;
}

interface ForkedRepo {
  html_url: string;
}

interface Actor {
  id: string;
  login: string;
  display_login: string;
  url: string;
  avatar_url: string;
}

interface IssueComment {
  html_url: string;
}

interface Commit {
  url: string; // this is a api url, not a html url
}

interface PullRequest {
  html_url: string;
}

interface Issue {
  html_url: string;
}

interface PullRequestComment {
  html_url: string;
}

interface Payload {}

// https://developer.github.com/v3/activity/events/types/#watchevent
interface WatchEventPayload extends Payload {
  action: GithubWatchAction;
}

// https://developer.github.com/v3/activity/events/types/#pushevent
interface PushEventPayload extends Payload {
  distinct_size: number;
  commits: Commit[];
}

// https://developer.github.com/v3/activity/events/types/#createevent
interface CreateEventPayload extends Payload {
  ref: string;
  ref_type: GithubCreateEventRefType;
}

// https://developer.github.com/v3/activity/events/types/#issuecommentevent
interface IssueCommentEventPayload extends Payload {
  action: GithubIssueCommentAction;
  comment: IssueComment;
}

// https://developer.github.com/v3/activity/events/types/#pullrequestevent
interface PullRequestEventPayload extends Payload {
  action: GithubPullRequestAction;
  pull_request: PullRequest;
}

// https://developer.github.com/v3/activity/events/types/#forkevent
interface ForkEventPayload extends Payload {
  forkee: ForkedRepo;
}

// https://developer.github.com/v3/activity/events/types/#forkevent
interface IssuesEventPayload extends Payload {
  action: GithubIssuesAction;
  issue: Issue;
}

// https://developer.github.com/v3/activity/events/types/#pullrequestreviewcommentevent
interface PullRequestReviewCommentEventPayload extends Payload {
  action: PullRequestReviewCommentAction;
  comment: PullRequestComment;
}

// Comes from Github API
export interface GithubEvent {
  id: string;
  type: GithubActivityEventType;
  actor: Actor;
  repo: Repo;
  payload: Payload;
  created_at: string; //"2020-04-17T18:08:49Z"
}

function deriveGithubEventTypeAndURL(
  githubEvent: GithubEvent
): [string, string] {
  const repoName = githubEvent.repo.name;
  if (githubEvent.type === "WatchEvent") {
    return ["starred repository", githubEvent.repo.url];
  } else if (githubEvent.type === "PushEvent") {
    const commitURLs = (githubEvent.payload as PushEventPayload).commits
      .map((commit) => commit.url)
      .join(",");
    return ["pushed commits", commitURLs];
  } else if (githubEvent.type === "CreateEvent") {
    const payload = githubEvent.payload as CreateEventPayload;
    let eventType: string;
    let eventURL: string;
    if (payload.ref_type === "branch") {
      eventType = "created branch";
      eventURL = `https://github.com/${repoName}/tree/${payload.ref}`;
    } else if (payload.ref_type === "repository") {
      eventType = "created repository";
      eventURL = `https://github.com/${repoName}`;
    } else {
      eventType = "unrecognized";
      eventURL = "";
    }
    return [eventType, eventURL];
  } else if (githubEvent.type === "IssueCommentEvent") {
    const payload = githubEvent.payload as IssueCommentEventPayload;
    return [`${payload.action} issue comment`, payload.comment.html_url];
  } else if (githubEvent.type === "PullRequestEvent") {
    const payload = githubEvent.payload as PullRequestEventPayload;
    return [`${payload.action} pull-request`, payload.pull_request.html_url];
  } else if (githubEvent.type === "ForkEvent") {
    const payload = githubEvent.payload as ForkEventPayload;
    return ["forked repository", payload.forkee.html_url];
  } else if (githubEvent.type === "IssueEvent") {
    const payload = githubEvent.payload as IssuesEventPayload;
    return [`${payload.action} issue`, payload.issue.html_url];
  } else if (githubEvent.type === "PullRequestReviewCommentEvent") {
    const payload = githubEvent.payload as PullRequestReviewCommentEventPayload;
    return [
      `${payload.action} pull-request-review-comment`,
      payload.comment.html_url,
    ];
  } else {
    return ["unrecognized", ""];
  }
}

export function convertGithubEvent(githubEvent: GithubEvent): ActivityEvent {
  const [eventType, eventURL] = deriveGithubEventTypeAndURL(githubEvent);
  return {
    source: "github",
    eventType,
    eventURL,
    description: "???",
    createdAt: new Date(githubEvent.created_at),
  };
}
