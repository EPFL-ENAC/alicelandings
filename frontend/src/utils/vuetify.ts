import { sample } from "lodash";
import colors, { Color } from "vuetify/lib/util/colors";

// https://vuetifyjs.com/en/api/v-select/#props-items
export interface SelectItemObject<
  // eslint-disable-next-line @typescript-eslint/ban-types
  T = string | number | object,
  // eslint-disable-next-line @typescript-eslint/ban-types
  V = string | number | object
> {
  text: T;
  value: V;
  disabled?: boolean;
  divider?: boolean;
  header?: string;
}

export type SelectItem = string | SelectItemObject;

export const ALL_COLORS: Color[] = [
  colors.red,
  colors.pink,
  colors.purple,
  colors.deepPurple,
  colors.indigo,
  colors.blue,
  colors.lightBlue,
  colors.cyan,
  colors.teal,
  colors.green,
  colors.lightGreen,
  colors.lime,
  colors.yellow,
  colors.amber,
  colors.orange,
  colors.deepOrange,
];

export interface TreeviewItem<V = string> {
  id: string;
  name: string;
  value: V;
  children?: TreeviewItem<V>[];
  disabled?: boolean;
  selected?: boolean;
}

export function randomColor(): Color {
  return sample(ALL_COLORS) ?? colors.blue;
}
