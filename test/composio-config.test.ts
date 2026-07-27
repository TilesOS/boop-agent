import { afterEach, describe, expect, it } from "vitest";
import {
  configuredAuthConfigIdFor,
  selectActiveConnections,
  type ConnectedToolkit,
} from "../server/composio.js";

const originalGithub = process.env.COMPOSIO_GITHUB_AUTH_CONFIG_ID;
const originalGoogleCal = process.env.COMPOSIO_GOOGLE_CAL_AUTH_CONFIG_ID;
const originalGenericGoogleCal = process.env.COMPOSIO_GOOGLECALENDAR_AUTH_CONFIG_ID;

afterEach(() => {
  setOrDelete("COMPOSIO_GITHUB_AUTH_CONFIG_ID", originalGithub);
  setOrDelete("COMPOSIO_GOOGLE_CAL_AUTH_CONFIG_ID", originalGoogleCal);
  setOrDelete("COMPOSIO_GOOGLECALENDAR_AUTH_CONFIG_ID", originalGenericGoogleCal);
});

describe("Composio auth config selection", () => {
  it("reads the documented GitHub and Google Calendar auth config variables", () => {
    process.env.COMPOSIO_GITHUB_AUTH_CONFIG_ID = "ac_github";
    process.env.COMPOSIO_GOOGLE_CAL_AUTH_CONFIG_ID = "ac_calendar";

    expect(configuredAuthConfigIdFor("github")).toBe("ac_github");
    expect(configuredAuthConfigIdFor("googlecalendar")).toBe("ac_calendar");
  });

  it("supports the generic toolkit-based variable name", () => {
    delete process.env.COMPOSIO_GOOGLE_CAL_AUTH_CONFIG_ID;
    process.env.COMPOSIO_GOOGLECALENDAR_AUTH_CONFIG_ID = "ac_generic";

    expect(configuredAuthConfigIdFor("googlecalendar")).toBe("ac_generic");
  });

  it("only selects active accounts belonging to the configured auth config", () => {
    const connections: ConnectedToolkit[] = [
      connection("ca_selected", "ac_selected", "ACTIVE"),
      connection("ca_other", "ac_other", "ACTIVE"),
      connection("ca_expired", "ac_selected", "EXPIRED"),
    ];

    expect(selectActiveConnections(connections, "github", "ac_selected")).toEqual([
      connections[0],
    ]);
  });
});

function connection(
  connectionId: string,
  authConfigId: string,
  status: string,
): ConnectedToolkit {
  return {
    slug: "github",
    connectionId,
    authConfigId,
    status,
  };
}

function setOrDelete(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
