interface Hashtag {
  id: string;
  tag: string;
}

/**
 * Compute the diff between existing hashtags and desired tags,
 * returning hashtags to remove and add payloads ready for syncBlogHashtags.
 */
export function computeHashtagDiff(
  existingHashtags: Hashtag[],
  desiredTags: string[],
  blogId: string
) {
  const existingTags = existingHashtags.map(ht => ht.tag);

  const hashtagsToRemove = existingHashtags
    .filter(ht => !desiredTags.includes(ht.tag))
    .map(ht => ({ id: ht.id }));

  const hashtagsToAdd = desiredTags
    .filter(tag => !existingTags.includes(tag))
    .map(tag => ({
      id: `${blogId}_${tag}`,
      tag,
      blog_id: blogId,
      category: '',
      color: '',
      bg_color: '',
      icon: '',
      description: '',
      amendment_id: '',
      event_id: '',
      group_id: '',
      user_id: '',
    }));

  return { hashtagsToRemove, hashtagsToAdd };
}
