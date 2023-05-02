import { ForwardChainingEngine } from "./forwardChainingEngine.mjs";
import { KnowledgeBase } from "./knowledgeBase.mjs";

describe("should implement forward chaining", () => {
  it("should create facts by deriving from the new rules", () => {
    const inferenceEngine = new ForwardChainingEngine();
    const knowledgeBase = new KnowledgeBase(inferenceEngine);
    ["Child son mom", "Child mom grandpa"].map((e) => knowledgeBase.addFact(e));
    expect(
      [
        "Child ?child grandpa",
        "Grandparent grandpa ?descendent",
        "Parent ?parent ?child",
        "Child son son",
      ].map((e) => knowledgeBase.query(e).join(", "))
    ).toMatchObject(["Child mom grandpa", "", "", ""]);

    [
      "Child ?child ?parent => Parent ?parent ?child",
      "Parent ?parent ?child => Child ?child ?parent",
      "Child ?child ?parent & Child ?parent ?grandparent => Grandparent ?grandparent ?child",
    ].map((e) => knowledgeBase.addRule(e));

    expect(
      [
        "Child ?child grandpa",
        "Grandparent grandpa ?descendent",
        "Parent ?parent ?child",
        "Child son son",
      ].map((e) => knowledgeBase.query(e).join(", "))
    ).toMatchObject([
      "Child mom grandpa",
      "Grandparent grandpa son",
      "Parent mom son, Parent grandpa mom",
      "",
    ]);
  });
});
