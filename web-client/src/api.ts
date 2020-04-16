import {
  convertStackoverflowUserTimeline,
  StackoverflowActivityEvent,
  StackoverflowUserTimeline,
} from "./types";

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

export async function listStackoverflowActivityEvents(
  userId: number
): Promise<StackoverflowActivityEvent[]> {
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
