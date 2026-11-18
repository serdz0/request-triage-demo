import type { DecisionEntry, RequestItem } from "./types";

// Fake people and teams only. No real data.
export const SEED_REQUESTS: RequestItem[] = [
  {
    id: "r1",
    title: "Export the weekly usage report to PDF",
    description:
      "Team leads want to attach the weekly usage report to their Monday meeting notes without copying numbers by hand.",
    requester: "Alex Novak",
    team: "Operations",
    status: "build",
    createdAt: "2026-11-02T09:00:00Z",
  },
  {
    id: "r2",
    title: "Custom colour theme per customer",
    description:
      "One customer asked for their brand colours across the whole platform. Nobody else has asked so far.",
    requester: "Sam Weber",
    team: "Sales",
    status: "kill",
    createdAt: "2026-11-03T10:30:00Z",
  },
  {
    id: "r3",
    title: "Bulk-edit asset tags",
    description:
      "Editors spend hours fixing tags one by one after each campaign. They want to select many items and change tags at once.",
    requester: "Mia Dubois",
    team: "Content",
    status: "new",
    createdAt: "2026-11-09T14:15:00Z",
  },
  {
    id: "r4",
    title: "Slack alert when a sync fails",
    description:
      "The nightly sync fails now and then and nobody notices until the next morning. Support wants a message in their channel.",
    requester: "Jan Horak",
    team: "Support",
    status: "new",
    createdAt: "2026-11-10T08:45:00Z",
  },
  {
    id: "r5",
    title: "Dark mode for the dashboard",
    description:
      "Several colleagues work late and find the dashboard too bright. No data on how many would use it.",
    requester: "Lena Fischer",
    team: "Marketing",
    status: "defer",
    createdAt: "2026-11-04T16:00:00Z",
  },
  {
    id: "r6",
    title: "Single sign-on for partner accounts",
    description:
      "External partners keep forgetting their passwords. IT says a login through their own company account would cut support tickets.",
    requester: "Omar Haddad",
    team: "IT",
    status: "new",
    createdAt: "2026-11-11T11:20:00Z",
  },
];

export const SEED_DECISIONS: DecisionEntry[] = [
  {
    id: "d1",
    requestId: "r1",
    decision: "build",
    reason: "Clear pain for many team leads and a small, well-understood change.",
    decidedAt: "2026-11-05T09:00:00Z",
  },
  {
    id: "d2",
    requestId: "r2",
    decision: "kill",
    reason: "One customer only, and it would add upkeep for every future change.",
    decidedAt: "2026-11-06T09:00:00Z",
  },
  {
    id: "d3",
    requestId: "r5",
    decision: "defer",
    reason: "Nice to have; revisit when we know how many people would use it.",
    decidedAt: "2026-11-06T09:30:00Z",
  },
];
