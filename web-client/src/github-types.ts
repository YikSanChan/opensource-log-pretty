import { Endpoints } from "@octokit/types";
import { ActivityEvent, What, Where, Who } from "./types";

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
  full_name: string;
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
  message: string;
  url: string; // this is a api url, not a html url
}

interface PullRequest {
  title: string;
  html_url: string;
}

interface Issue {
  title: string;
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
  issue: Issue;
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

// https://developer.github.com/v3/activity/events/types/#issuesevent
interface IssuesEventPayload extends Payload {
  action: GithubIssuesAction;
  issue: Issue;
}

// https://developer.github.com/v3/activity/events/types/#pullrequestreviewcommentevent
interface PullRequestReviewCommentEventPayload extends Payload {
  action: PullRequestReviewCommentAction;
  comment: PullRequestComment;
  pull_request: PullRequest;
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

interface DoSomethingSomewhere {
  what: What;
  where?: Where;
}

function deriveGithubEventAndSubject(
  githubEvent: GithubEvent
): DoSomethingSomewhere {
  const repoName = githubEvent.repo.name;
  const repoURL = `https://github.com/${repoName}`;
  const atRepo: Where = {
    prep: "at",
    somewhereDisplay: repoName,
    somewhereURL: repoURL,
  };
  if (githubEvent.type === "WatchEvent") {
    return {
      what: {
        do: "starred repository",
        somethingDisplay: repoName,
        somethingURL: repoURL,
      },
    };
  } else if (githubEvent.type === "PushEvent") {
    const payload = githubEvent.payload as PushEventPayload;
    const commitMessages = JSON.stringify(
      payload.commits.map((commit) => commit.message)
    );
    const commitURLs = JSON.stringify(
      payload.commits.map((commit) => commit.url)
    );
    return {
      what: {
        do: "pushed commits",
        somethingDisplay: commitMessages,
        somethingURL: commitURLs,
      },
      where: atRepo,
    };
  } else if (githubEvent.type === "CreateEvent") {
    const payload = githubEvent.payload as CreateEventPayload;
    if (payload.ref_type === "branch") {
      return {
        what: {
          do: "created branch",
          somethingDisplay: payload.ref,
          somethingURL: `https://github.com/${repoName}/tree/${payload.ref}`,
        },
        where: atRepo,
      };
    } else if (payload.ref_type === "repository") {
      return {
        what: {
          do: "created repository",
          somethingDisplay: repoName,
          somethingURL: repoURL,
        },
      };
    } else {
      return {
        what: {
          do: "unrecognized",
          somethingDisplay: "",
          somethingURL: "",
        },
      };
    }
  } else if (githubEvent.type === "IssueCommentEvent") {
    const payload = githubEvent.payload as IssueCommentEventPayload;
    return {
      what: {
        do: `${payload.action} issue-comment`,
        somethingDisplay: payload.issue.title,
        somethingURL: payload.comment.html_url,
      },
      where: atRepo,
    };
  } else if (githubEvent.type === "PullRequestEvent") {
    const payload = githubEvent.payload as PullRequestEventPayload;
    return {
      what: {
        do: `${payload.action} pull-request`,
        somethingDisplay: payload.pull_request.title,
        somethingURL: payload.pull_request.html_url,
      },
      where: atRepo,
    };
  } else if (githubEvent.type === "ForkEvent") {
    const payload = githubEvent.payload as ForkEventPayload;
    return {
      what: {
        do: "forked repository",
        somethingDisplay: repoName,
        somethingURL: repoURL,
      },
      where: {
        prep: "into",
        somewhereDisplay: payload.forkee.full_name,
        somewhereURL: payload.forkee.html_url,
      },
    };
  } else if (githubEvent.type === "IssueEvent") {
    const payload = githubEvent.payload as IssuesEventPayload;
    return {
      what: {
        do: `${payload.action} issue`,
        somethingDisplay: payload.issue.title,
        somethingURL: payload.issue.html_url,
      },
      where: atRepo,
    };
  } else if (githubEvent.type === "PullRequestReviewCommentEvent") {
    const payload = githubEvent.payload as PullRequestReviewCommentEventPayload;
    return {
      what: {
        do: `${payload.action} pull-request-review-comment`,
        somethingDisplay: payload.pull_request.title,
        somethingURL: payload.comment.html_url,
      },
      where: atRepo,
    };
  } else {
    return {
      what: {
        do: "unrecognized",
        somethingDisplay: "",
        somethingURL: "",
      },
    };
  }
}

export function convertGithubEvent(githubEvent: GithubEvent): ActivityEvent {
  const { what, where } = deriveGithubEventAndSubject(githubEvent);
  const who: Who = {
    username: githubEvent.actor.display_login,
    profileURL: `https://github.com/${githubEvent.actor.display_login}`,
  };
  return {
    source: "github",
    who,
    what,
    where,
    when: new Date(githubEvent.created_at),
  };
}
