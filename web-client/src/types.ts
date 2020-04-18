export interface ActivityEvent {
  source: "github" | "stackoverflow";
  what: DoSomething;
  where?: Somewhere;
  when: Date;
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
