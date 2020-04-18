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

// Max according to my experiment.
// https://developer.github.com/v3/activity/events/ says events API doesn't support per_page, but that's not true
const GITHUB_PAGESIZE = 100;

// Max according to https://api.stackexchange.com/docs/paging
const STACKEXCHANGE_PAGESIZE = 100;

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
      return b.when.getTime() - a.when.getTime();
    })
  );
}

function listStackoverflowActivityEvents(
  userId: string
): Promise<ActivityEvent[]> {
  function listStackoverflowActivityEventsRecursively(
    fetchedEvents: StackoverflowUserTimeline[],
    page: number,
    userId: string
  ): Promise<StackoverflowUserTimeline[]> {
    const url = `${STACKEXCHANGE_DOMAIN}/users/${userId}/timeline?site=stackoverflow&page=${page}&pagesize=${STACKEXCHANGE_PAGESIZE}&filter=!))yem8S`;
    return fetch2(url).then((resp) => {
      const newEvents = resp.items as StackoverflowUserTimeline[];
      const newFetchedEvents = [...fetchedEvents, ...newEvents];
      if (!resp.has_more) {
        return newFetchedEvents;
      } else {
        return listStackoverflowActivityEventsRecursively(
          newFetchedEvents,
          page + 1,
          userId
        );
      }
    });
  }

  return listStackoverflowActivityEventsRecursively(
    [],
    1,
    userId
  ).then((stackoverflowUserTimelines) =>
    stackoverflowUserTimelines
      .map((stackoverflowUserTimeline) =>
        convertStackoverflowUserTimeline(stackoverflowUserTimeline)
      )
      .filter((event) => event.what.do !== "unrecognized")
  );
}

function listGithubActivityEvents(username: string): Promise<ActivityEvent[]> {
  function listGithubActivityEventsRecursively(
    fetchedEvents: GithubEvent[],
    page: number,
    username: string
  ): Promise<GithubEvent[]> {
    const params: ListUserPublicEventsParameters = {
      username,
      page,
      per_page: GITHUB_PAGESIZE,
    };
    return octokit.activity.listPublicEventsForUser(params).then((resp) => {
      const newEvents = resp.data as GithubEvent[];
      if (newEvents.length === 0) {
        return fetchedEvents;
      }
      const newFetchedEvents = [...fetchedEvents, ...newEvents];
      return listGithubActivityEventsRecursively(
        newFetchedEvents,
        page + 1,
        username
      );
    });
  }

  return listGithubActivityEventsRecursively(
    [],
    1,
    username
  ).then((githubEvents) =>
    githubEvents
      .map((githubEvent) => convertGithubEvent(githubEvent))
      .filter((event) => event.what.do !== "unrecognized")
  );
}
