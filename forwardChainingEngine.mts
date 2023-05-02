import type { InferenceEngine } from "./knowledgeBase.mjs";
import { Predicate, Substitution, Value, Variable } from "./queryLang.mjs";

export class ForwardChainingEngine implements InferenceEngine {
  performQuery(facts: Set<Predicate>, q: Predicate): Set<Substitution> {
    return [...facts].reduce((acc, curr) => {
      const matchRes = this.matchFact(curr, q);
      matchRes && acc.add(matchRes);
      return acc;
    }, new Set<Substitution>());
  }
  private matchFact(stored: Predicate, q: Predicate): Substitution | null {
    const baseCheck =
      stored.parsed.relation === q.parsed.relation &&
      stored.parsed.terms.length === q.parsed.terms.length;
    if (!baseCheck) return null;
    return this.matchTerms({ stored, query: q });
  }
  private matchTerms({
    stored,
    query,
  }: {
    stored: Predicate;
    query: Predicate;
  }): Substitution | null {
    return stored.parsed.terms.reduce((acc, storedTerm, i) => {
      if (acc === null) return acc;
      const queryTerm = query.parsed.terms[i];
      if (queryTerm instanceof Variable) {
        return new Substitution({
          ...acc.data,
          [queryTerm.parsed]: storedTerm as Value,
        });
      }
      if (queryTerm.parsed !== storedTerm.parsed) {
        return null;
      }
      return acc;
    }, new Substitution({}) as Substitution | null);
  }
}
