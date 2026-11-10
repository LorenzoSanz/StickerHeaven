import { describe, expect, it } from "bun:test";
import { Session } from "./Session";
import { SessionId } from "./SessionId";
import { UserId } from "./UserId";

describe("Session immutability", () => {
  it("does not expose mutable Date references", () => {
    const userId = UserId.random();
    const createdAt = new Date("2020-01-01T00:00:00.000Z");
    const expiresAt = new Date("2020-01-01T01:00:00.000Z");

    const session = Session.reconstitute({ userId, createdAt, expiresAt }, SessionId.random());

    const leakedCreatedAt = session.createdAt;
    leakedCreatedAt.setTime(0);
    expect(session.createdAt.toISOString()).toBe("2020-01-01T00:00:00.000Z");

    const leakedExpiresAt = session.expiresAt;
    leakedExpiresAt.setTime(0);
    expect(session.expiresAt.toISOString()).toBe("2020-01-01T01:00:00.000Z");
  });
});

