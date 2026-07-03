export interface ObservatoryCardInput {
  sourceTitle: string;
  fieldNoteTitle?: string | null;
  articleAngle?: string | null;
  humanNote?: string | null;
}

export interface ObservatoryCardDisplay {
  heading: string;
  subline: string | null;
  humanNoteExcerpt: string | null;
  sourceTitle: string;
}

function excerpt(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max) + "…";
}

export function getObservatoryCardDisplay(
  input: ObservatoryCardInput
): ObservatoryCardDisplay {
  const fieldNote = input.fieldNoteTitle?.trim() || null;
  const angle = input.articleAngle?.trim() || null;
  const human = input.humanNote?.trim() || null;
  const humanExcerpt = human ? excerpt(human) : null;

  let heading: string;
  let subline: string | null = null;
  let humanNoteExcerpt: string | null = null;

  if (fieldNote) {
    heading = fieldNote;
    if (angle && angle !== heading) subline = angle;
    if (humanExcerpt && humanExcerpt !== heading && humanExcerpt !== subline) {
      humanNoteExcerpt = humanExcerpt;
    }
  } else if (angle) {
    heading = angle;
    if (humanExcerpt && humanExcerpt !== heading) {
      humanNoteExcerpt = humanExcerpt;
    }
  } else if (humanExcerpt) {
    heading = humanExcerpt;
  } else {
    heading = "観測待ちの断片";
  }

  return {
    heading,
    subline,
    humanNoteExcerpt,
    sourceTitle: input.sourceTitle,
  };
}
