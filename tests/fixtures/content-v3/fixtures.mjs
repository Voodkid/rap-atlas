export const profiles = {
  sound_direction: { kind: "genre", sections: ["overview", "sound", "make", "listen"] },
  scene_context: { kind: "scene", sections: ["overview", "context", "place-time", "participants"] },
  organization: { kind: "collective", sections: ["overview", "role", "people-catalog"] },
  term_reference: { kind: "search_tag", sections: ["overview", "meaning", "usage-boundaries"] },
  release_reference: { kind: "release", sections: ["overview", "release-context", "credits"] },
};

export function fixtureCard(profile, id = `example-${profile.replaceAll("_", "-")}`, withMedia = profile === "sound_direction") {
  const definition = profiles[profile];
  const card = { schemaVersion: "1.0.0", taxonomyVersion: "3.0.0", contentRevision: 1, id, kind: definition.kind, contentProfile: profile, status: "provisional", preferredLabels: { ru: `Example ${profile}` }, summary: { ru: "Synthetic fixture only." }, profileData: {}, relations: [] };
  const evidence = { schemaVersion: "1.0.0", entityId: id, sources: [{ id: "source-example", type: "other", url: "https://example.invalid/source" }], evidence: [{ id: "evidence-example", sourceId: "source-example" }], claims: [{ id: "claim-example", evidenceIds: ["evidence-example"] }] };
  const review = { schemaVersion: "1.0.0", entityId: id, state: "draft", owner: "example-owner" };
  const markdown = [`# Example ${profile}`, ...definition.sections.filter((section) => section !== "listen" || withMedia).map((section) => `## Example {#${section}}\n<!-- claims: claim-example -->\nSynthetic fixture paragraph.`)].join("\n\n");
  const media = withMedia ? { schemaVersion: "1.0.0", entityId: id, references: [], assets: [{ id: "asset-example", path: "assets\\example.fixture" }], derivedAssets: [], playlists: [] } : undefined;
  return { id, card, evidence, review, markdown, media };
}

export const invalidFixtureNames = ["invalid-kind-profile", "missing-required-file", "empty-media", "invalid-markdown-section", "wrong-section-order", "dangling-claim", "dangling-relation", "cyclic-branch-relation", "path-traversal", "incompatible-schema-version", "unsafe-raw-html"];
