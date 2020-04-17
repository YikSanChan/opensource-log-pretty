export interface ActivityEvent {
  source: "github" | "stackoverflow";
  eventType: string;
  eventURL: string;
  description: string;
  createdAt: Date;
}
