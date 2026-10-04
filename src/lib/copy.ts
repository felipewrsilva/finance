import messages from "../../messages/pt-BR.json";

export const nav = messages.nav;
export const tools = messages.tools;

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
}
