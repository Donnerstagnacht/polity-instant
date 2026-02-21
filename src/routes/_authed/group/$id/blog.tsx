import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useBlogState } from '@/zero/blogs/useBlogState'
import { BlogListTab } from '@/features/users/ui/BlogListTab'

export const Route = createFileRoute('/_authed/group/$id/blog')({
  component: GroupBlogPage,
})

function GroupBlogPage() {
  const { id } = Route.useParams()
  const { blogsByGroup: blogRows } = useBlogState({ groupId: id })
  const blogs = (blogRows || []).map((blog: any) => ({
    id: blog.id,
    title: blog.title || '',
    date: blog.date || '',
    description: blog.description,
    imageURL: blog.imageURL,
    commentCount: blog.commentCount,
    hashtags: blog.hashtags,
  })).filter((b: any) => b.id)
  const [searchValue, setSearchValue] = useState('')

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Group Blog</h1>
      <BlogListTab blogs={blogs} searchValue={searchValue} onSearchChange={setSearchValue} />
    </div>
  )
}
