import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BlogListTab } from '@/features/users/ui/BlogListTab'
import { useBlogState } from '@/zero/blogs/useBlogState'

export const Route = createFileRoute('/_authed/user/$id/blog')({
  component: UserBlogPage,
})

function UserBlogPage() {
  const { id } = Route.useParams()
  const [searchValue, setSearchValue] = useState('')
  const { bloggersByUser: bloggerRows } = useBlogState({ userId: id })

  const blogs = (bloggerRows || [])
    .map((row: any) => ({
      id: row.blog?.id,
      title: row.blog?.title || '',
      date: row.blog?.date || '',
      description: row.blog?.description,
      imageURL: row.blog?.image_url,
      commentCount: row.blog?.comment_count,
      groupId: row.blog?.group_id,
      authorId: id,
      authorName: row.user
        ? [row.user.first_name, row.user.last_name].filter(Boolean).join(' ') || row.user.handle || ''
        : undefined,
      authorAvatar: row.user?.avatar,
      hashtags: (row.blog?.blog_hashtags ?? []).map((bh: any) => bh.hashtag).filter(Boolean),
    }))
    .filter((b: any) => b.id)

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Blog Posts</h1>
      <BlogListTab blogs={blogs} userId={id} searchValue={searchValue} onSearchChange={setSearchValue} />
    </div>
  )
}
