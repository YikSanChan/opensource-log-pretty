import {
  convertStackoverflowUserTimeline,
  StackoverflowUserTimeline,
} from "./stackoverflow-types";
import { convertGithubEvent, GithubEvent } from "./github-types";
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
const GITHUB_DOMAIN = "https://api.github.com";

// Max according to my experiment.
// https://developer.github.com/v3/activity/events/ says events API doesn't support per_page, but that's not true
const GITHUB_PAGESIZE = 100;

// Max according to https://api.stackexchange.com/docs/paging
const STACKEXCHANGE_PAGESIZE = 100;

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

// According to https://developer.github.com/v3/guides/traversing-with-pagination/#basics-of-pagination
// Always rely on these link relations provided to you. Don't try to guess or construct your own URL.
function listGithubActivityEvents(username: string): Promise<ActivityEvent[]> {
  function extractNextURLFromGithubLink(link: string): string | undefined {
    // an example: <https://api.github.com/user/17229109/events/public?page=2&per_page=100>; rel="next", <https://api.github.com/user/17229109/events/public?page=2&per_page=100>; rel="last"
    const rels = link.split(", ");
    let nextURL;
    rels.forEach((rel) => {
      const parts = rel.split("; ");
      const urlPart = parts[0];
      const relPart = parts[1];
      if (relPart === `rel="next"`) {
        nextURL = urlPart.substring(1, urlPart.length - 1);
      }
    });
    return nextURL;
  }

  // TODO: fix username=touchdown render-nothing bug
  function listGithubActivityEventsRecursively(
    fetchedEvents: GithubEvent[],
    url: string
  ): Promise<GithubEvent[]> {
    return fetch(url).then((resp) => {
      const link = resp.headers.get("link");
      const nextURL =
        link === null ? undefined : extractNextURLFromGithubLink(link);
      return handleJSONResponse(resp).then((data) => {
        const newEvents = data as GithubEvent[];
        const newFetchedEvents = [...fetchedEvents, ...newEvents];
        console.log("count:" + newFetchedEvents.length);

        // Stop pagination if there is no next page
        // https://developer.github.com/v3/guides/traversing-with-pagination/#navigating-through-the-pages
        if (nextURL === undefined) return newFetchedEvents;
        return listGithubActivityEventsRecursively(newFetchedEvents, nextURL);
      });
    });
  }

  const url = `${GITHUB_DOMAIN}/users/${username}/events/public?page=1&per_page=${GITHUB_PAGESIZE}`;
  return listGithubActivityEventsRecursively([], url).then((githubEvents) =>
    githubEvents
      .map((githubEvent) => convertGithubEvent(githubEvent))
      .filter((event) => event.what.do !== "unrecognized")
  );
}
