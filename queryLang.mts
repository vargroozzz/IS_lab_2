export class Value {
  parsed: string;
  constructor(readonly raw: string) {
    this.parsed = raw;
  }
}
export class Variable {
  static is(t: string) {
    return t.startsWith("?");
  }
  parsed: string;
  constructor(readonly raw: string) {
    this.parsed = raw.replace("?", "");
  }
}
export type Term = Variable | Value;
export class Predicate {
  parsed: {
    relation: string;
    terms: Term[];
  };
  constructor(raw: string) {
    this.parsed = {
      relation: raw.split(" ")[0],
      terms: raw
        .split(" ")
        .slice(1)
        .map((e) => (Variable.is(e) ? new Variable(e) : new Value(e))),
    };
  }

  toString() {
    return (
      this.parsed.relation + " " + this.parsed.terms.map((e) => e.raw).join(" ")
    );
  }

  private mapTerms(f: (t: Term) => Term): Predicate {
    const predicate = new Predicate(this.toString());
    predicate.parsed.terms = predicate.parsed.terms.map((t) => f(t));
    return new Predicate(predicate.toString());
  }

  public bindSubstitution(substitution: Substitution): Predicate {
    return this.mapTerms((t) => {
      return t instanceof Variable && t.parsed in substitution.data
        ? substitution.data[t.parsed]
        : t;
    });
  }
}

export class Substitution {
  constructor(public readonly data: Record<string, Value>) {}
}

export class Rule {
  predicates: Predicate[];
  res: Predicate;
  constructor(text: string) {
    this.predicates = text
      .split("=>")[0]
      .split("&")
      .map((e) => e.trim())
      .map((e) => new Predicate(e));

    this.res = new Predicate(text.split("=>")[1].trim());
  }
  toString() {
    return (
      this.predicates.map((e) => e.toString()).join(" & ") +
      " => " +
      this.res.toString()
    );
  }
}
