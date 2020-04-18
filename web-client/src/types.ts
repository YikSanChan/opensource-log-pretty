export interface ActivityEvent {
  source: "github" | "stackoverflow";
  who: Who;
  what: DoSomething;
  where?: Somewhere;
  when: Date;
}

export interface Who {
  username: string;
  profileURL: string;
}

export interface DoSomething {
  do: string;
  somethingDisplay: string;
  somethingURL: string;
}

export interface Somewhere {
  prep: string;
  somewhereDisplay: string;
  somewhereURL: string;
}
