import { Fragment, type ReactNode } from "react";

/** Replaces {call}, {whatsapp}, {phone}, {privacy}… in editable text with real links. */
export function withTokens(text: string, tokens: Record<string, ReactNode>): ReactNode {
  return text.split(/(\{[a-z]+\})/g).map((part, i) => {
    const key = part.match(/^\{([a-z]+)\}$/)?.[1];
    return <Fragment key={i}>{key && key in tokens ? tokens[key] : part}</Fragment>;
  });
}
