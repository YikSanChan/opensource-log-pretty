import {
  convertStackoverflowUserTimeline,
  StackoverflowUserTimeline,
} from "./stackoverflow-types";
import {
  convertGithubEvent,
  GithubEvent,
  ListUserPublicEventsParameters,
} from "./github-types";
import { Octokit } from "@octokit/rest";
import { ActivityEvent } from "./types";

// Copy from https://css-tricks.com/using-fetch/
function fetch2(url: string) {
  return fetch(url)
    .then(handleJSONResponse)
    .catch((error) => console.error(error));
}

function handleJSONResponse(response: Response) {
  return response.json().then((json) => {
    if (response.status >= 200 && response.status <= 299) {
      return json;
    } else {
      return Promise.reject({
        ...json,
        status: response.status,
        statusText: response.statusText,
      });
    }
  });
}

const STACKEXCHANGE_DOMAIN = "https://api.stackexchange.com/2.2";

const octokit = new Octokit();

export function listActivityEvents(
  stackoverflowUserId?: string,
  githubUsername?: string
): Promise<ActivityEvent[]> {
  const fetchStackoverflow =
    stackoverflowUserId === undefined
      ? Promise.resolve([])
      : listStackoverflowActivityEvents(stackoverflowUserId);

  const fetchGithub =
    githubUsername === undefined
      ? Promise.resolve([])
      : listGithubActivityEvents(githubUsername);

  return Promise.all([fetchStackoverflow, fetchGithub]).then((responses) =>
    responses.flat().sort(function (a: ActivityEvent, b: ActivityEvent) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
  );
}

// TODO: fetch all
async function listStackoverflowActivityEvents(
  userId: string
): Promise<ActivityEvent[]> {
  const url = `${STACKEXCHANGE_DOMAIN}/users/${userId}/timeline?site=stackoverflow&filter=!))yem8S`;
  return fetch2(url).then((data) =>
    (data.items as StackoverflowUserTimeline[])
      .map((userTimeline) => convertStackoverflowUserTimeline(userTimeline))
      .filter(
        (stackoverflowActivityEvent) =>
          stackoverflowActivityEvent.eventType !== "unrecognized"
      )
  );
}

// TODO: fetch all
async function listGithubActivityEvents(
  username: string
): Promise<ActivityEvent[]> {
  const params: ListUserPublicEventsParameters = { username, per_page: 100 };
  return octokit.activity
    .listPublicEventsForUser(params)
    .then((resp) =>
      (resp.data as GithubEvent[])
        .map((githubEvent) => convertGithubEvent(githubEvent))
        .filter(
          (githubActivityEvent) =>
            githubActivityEvent.eventType !== "unrecognized"
        )
    );
}
