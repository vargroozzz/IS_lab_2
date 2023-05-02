import { Predicate, Rule, Substitution } from "./queryLang.mjs";

export class KnowledgeBase {
  facts = new Set<Predicate>();
  rules = new Set<Rule>();
  constructor(private readonly inferenceEngine: InferenceEngine) {}
  query(q: string) {
    const predicate = new Predicate(q);
    const res = this.inferenceEngine.performQuery(this.facts, predicate);
    return [...res].map((substitution) => {
      return predicate.bindSubstitution(substitution);
    });
  }
  addFact(f: string) {
    if ([...this.facts].some((e) => e.toString() === f)) {
      return;
    }
    const fact = new Predicate(f);
    this.facts.add(fact);
    // TODO: implement forward chaining when adding fact
  }
  addRule(t: string) {
    if ([...this.rules].some((e) => e.toString() === t)) {
      return;
    }
    const rule = new Rule(t);
    this.rules = this.rules.add(rule);
    const matches = rule.predicates.reduce(
      (substitutions, predicate) => {
        return substitutions.flatMap((s) =>
          [
            ...this.inferenceEngine.performQuery(
              this.facts,
              predicate.bindSubstitution(s)
            ),
          ].map(
            (e) =>
              new Substitution({
                ...s.data,
                ...e.data,
              })
          )
        );
      },
      [new Substitution({})] as Substitution[]
    );
    matches.map((e) => this.addFact(rule.res.bindSubstitution(e).toString()));
  }
}

export interface InferenceEngine {
  performQuery(facts: Set<Predicate>, q: Predicate): Set<Substitution>;
}
