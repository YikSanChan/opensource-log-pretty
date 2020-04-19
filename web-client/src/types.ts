export interface ActivityEvent {
  source: "github" | "stackoverflow";
  who: Who;
  what: What;
  where?: Where;
  when: Date;
}

export interface Who {
  username: string;
  profileURL: string;
}

export interface What {
  do: string;
  somethingDisplay: string;
  somethingURL: string;
}

export interface Where {
  prep: string;
  somewhereDisplay: string;
  somewhereURL: string;
}
