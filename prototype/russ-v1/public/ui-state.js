export function draftAfterRequest({ submittedDraft, currentDraft, explicitContent = null, succeeded }) {
  if (explicitContent !== null) {
    if (succeeded) return currentDraft;
    return currentDraft || explicitContent;
  }
  if (succeeded) return currentDraft === submittedDraft ? '' : currentDraft;
  return currentDraft || submittedDraft;
}
