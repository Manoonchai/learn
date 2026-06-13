import { lessons as raw } from "../data/lessons";
import type { Lesson } from "./types";

export const lessons: Lesson[] = raw;

/** Look up a lesson by name, falling back to the first lesson. */
export function lessonByName(name: string | undefined): Lesson {
  return lessons.find((l) => l.name === name) ?? lessons[0];
}
