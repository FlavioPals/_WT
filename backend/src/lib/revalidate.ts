// TODO(TASK-11.14): wire up Next.js on-demand revalidation webhook
export async function revalidateProject(_slug?: string): Promise<void> {
  void _slug
  // no-op until frontend integration in TASK 11.14
}

export async function revalidateSiteContent(_keysOrGroups?: string[]): Promise<void> {
  void _keysOrGroups
  // no-op until frontend integration in TASK 11.14
}
